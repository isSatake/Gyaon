var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var cookie = require('cookie');
var model = require('../model/model');
var id = require('../util/id');
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

router.get('/', function(req, res, next) {
  var gyaonId = (
    typeof req.cookies.gyaonId === "undefined"
    ? res.cookie('gyaonId', id.generate())
    : req.cookies.gyaonId
  );
  res.render('index');
});
router.get('/:gyaonId', function(req, res, next) {
  var gyaonId = req.params.gyaonId;
  res.cookie('gyaonId', gyaonId)
  res.render('index');
});

router.get('/sounds/:gyaonId', function(req, res){
  //ユーザの音声リストを返却
  var gyaonId = req.params.gyaonId
  model.promiseGetSounds(gyaonId).then(function(result){
    res.send({
      endpoint: endPoint,
      sounds: result
    });
  }).catch(function (err) { console.error(err.stack || err) });
});

// router.get('/', function(req, res, next) {
//   var gyaonId = (
//     typeof req.cookies.gyaonId === "undefined"
//     ? res.cookie('gyaonId', id.generate())
//     : req.cookies.gyaonId
//   );
//   debug("gyaonId : " + gyaonId);
//   model.promiseGetSounds(gyaonId).then(function(result){
//     res.render('index', {
//       id: gyaonId,
//       endpoint: endPoint,
//       sounds: result,
//       format: formatDate
//     });
//   }).catch(function (err) { console.error(err.stack || err) });
// });
//
// router.get('/:id', function(req, res, next) {
//   var gyaonId = req.params.id;
//   res.cookie('gyaonId', gyaonId)
//   debug("gyaonId : " + gyaonId);
//   model.promiseGetSounds(gyaonId).then(function(result){
//     res.render('index', {
//       id: gyaonId,
//       endpoint: endPoint,
//       sounds: result,
//       format: formatDate
//     });
//   }).catch(function (err) { console.error(err.stack || err) });
// });

//音声データをリダイレクト
router.get('/sounds/:id/:name:ext(.wav|.mp3)?', function(req, res){
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  res.redirect(strageEndPoint + "/" + gyaonId + "/" + fileName);
});

/* 音声データ受け取り */
router.post('/upload/:gyaonId', function(req, res) {
  //TODO Cookieでやり取りしたくないが,Androidクライアントをfixしないといけない
  var gyaonId = typeof req.params.gyaonId === undefined ? req.cookies.gyaonId : req.params.gyaonId;
  promiseUploadDir().then(function() {
    var form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/tmp";
    form.multiples = false;
    form.on("file", function(name, file) {
      debug(file);
      model.promiseUploadSound(gyaonId, file).then(function(sound){
        debug(sound);
        res.setHeader("Access-Control-Allow-Origin", "*");
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
