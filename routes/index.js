var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');
var shortid = require('shortid');
var formidable = require('formidable');
var debug = require("debug")("index");
var model = require('../model/model');
var formatDate = require('../util/formatdate');

var endPoint = process.env.BASE_URL || 'http://localhost:3000';
var strageEndPoint = 'https://s3-us-west-2.amazonaws.com/gyaon';

//create tmp folder
var promiseUploadDir = function() {
  return new Promise(function(resolve, reject) {
    var dir = path.resolve("./public/tmp");
    fs.mkdir(dir, function(err) {
      err ? resolve(err) : resolve();
    });
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var gyaonId = shortid.generate();
  debug("gyaonId : " + gyaonId);
  model.promiseGetSounds(gyaonId).then(function(result){
    res.render('index', {
      id: gyaonId,
      endpoint: endPoint,
      sounds: result,
      format: formatDate
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

router.get('/:id', function(req, res, next) {
  var gyaonId = req.params.id;
  debug("gyaonId : " + gyaonId);
  model.promiseGetSounds(gyaonId).then(function(result){
    res.render('index', {
      id: gyaonId,
      endpoint: endPoint,
      sounds: result,
      format: formatDate
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

//音声データをリダイレクト
router.get('/sounds/:id/:name:ext(.wav|.mp3)?', function(req, res){
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  res.redirect(strageEndPoint + "/" + gyaonId + "/" + fileName);
});

/* 音声データ受け取り */
router.post('/upload', function(req, res) {
  promiseUploadDir().then(function() {
    var form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/tmp";
    form.parse(req, function(err, fields, files){
      debug(fields);
      model.promiseUploadSound(fields.gyaonId, files.file).then(function(sound){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).set("Content-Type", "application/json").json({
          endpoint: endPoint,
          object: sound
        }).end();
      });
    })
    form.on('error', function(err){
      console.error(err.stack || err);
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

/* コメント編集 */
router.post('/comment/:id/:name', function(req, res) {
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  var text = req.body.value;
  debug(`comment on ${gyaonId}/${fileName} : ${text}`);
  model.promiseEditComment(gyaonId, fileName, text).then(function(){
    res.status(200).end();
  });
});

/* 音声削除 */
router.delete('/:id/:name', function(req, res){
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  debug(`delete ${gyaonId}/${fileName}`);
  model.promiseDeleteSound(gyaonId, fileName).then(function(){
    res.status(200).end();
  }).catch(function (err) { console.error(err.stack || err) });
});

module.exports = router;
