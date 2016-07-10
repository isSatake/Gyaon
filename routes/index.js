var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var cookie = require('cookie');
var model = require('../model/model');

var endPoint = 'https://s3-us-west-2.amazonaws.com/gyaon/';

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
  model.promiseGetSoundsEachDay(gyaonId).then(function(result){
    res.render('index', {
      id: gyaonId,
      endpoint: 'https://s3-us-west-2.amazonaws.com/gyaon/',
      list: result
    });
  }).catch(function (err) { console.error(err.stack || err) });
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
