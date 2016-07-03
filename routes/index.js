var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var cookie = require('cookie');
var id = require('../util/id');
var s3 = require('../util/s3');

//create tmp folder
var promiseUploadDir = function() {
  return new Promise(function(resolve, reject) {
    var dir = path.resolve("./public/tmp");
    fs.mkdir(dir, function(err) {
      err ? resolve(err) : resolve();
    });
  });
};

/* GET home page. */
router.get('/', function(req, res, next) {
  var gyaonId = (
      typeof req.cookies.gyaonId === "undefined"
    ? res.cookie('gyaonId', id.generate())
    : req.cookies.gyaonId
  );
  debug("gyaonId : " + gyaonId);
  s3.promiseGetUserFileList(gyaonId).then(function(list){
    res.render('index', {
      id: gyaonId,
      title: 'Gyaon',
      fileList: list
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
      fs.readFile(file.path, function(err, data){
        if(err) throw err;
        s3.promiseUploadAndGetUrl(gyaonId, data).then(function(fileObj){
          res.status(200).set("Content-Type", "application/json").json({
            file: fileObj.name,
            url: fileObj.url
          }).end();
        });
      });
      fs.unlink(file.path, function(err){
        if(err) throw err;
      });
    });
    form.parse(req);
    form.on('error', function(err){
      console.error(err.stack || err);
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

/* 音声削除 */
router.delete('/:id', function(req, res){
  var gyaonId = req.cookies.gyaonId;
  var fileName = req.params.id;
  s3.deleteObject({Key: gyaonId + "/" + fileName}, function(err, data){
    if(err) throw err;
    res.status(200).end();
  });
});

module.exports = router;
