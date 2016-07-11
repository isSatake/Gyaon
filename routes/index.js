var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var cookie = require('cookie');
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
  var gyaonId = (
    typeof req.cookies.gyaonId === "undefined"
    ? res.cookie('gyaonId', id.generate())
    : req.cookies.gyaonId
  );
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
  model.promiseFindSound(gyaonId, fileName).then(function(sound){
    if(sound.length == 0){
      res.render('error', {
        error: { status: 404 }
      });
    }else{
      request(strageEndPoint + "/" + gyaonId + "/" + fileName).pipe(res);
    }
  }).catch(function (err) {
    res.status(500).end();
  });

});

/* 音声データ受け取り */
router.post('/upload', function(req, res) {
  var gyaonId = req.cookies.gyaonId;
  promiseUploadDir().then(function() {
    var form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/tmp";
    form.multiples = false;
    form.on("file", function(name, file) {
      model.promiseUploadSound(gyaonId, file).then(function(sound){
        res.status(200).set("Content-Type", "application/json").json({
          endpoint: endPoint,
          object: sound
        }).end();
      });
    });
    form.parse(req);
    form.on('error', function(err){
      console.error(err.stack || err);
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

/* 音声削除 */
router.delete('/:id/:name', function(req, res){
  var key = `${req.params.id}/${req.params.name}`;
  debug(key);
  model.promiseDeleteSound(key).then(function(){
    res.status(200).end();
  }).catch(function (err) { console.error(err.stack || err) });
});

module.exports = router;
