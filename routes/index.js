var express     = require('express');
var router      = express.Router();

var request     = require('request');
var fs          = require('fs');
var path        = require('path');
var shortid     = require('shortid');
var formidable  = require('formidable');
var debug       = require("debug")("index");

var model       = require('../model/model');
var formatDate  = require('../util/formatdate');

var endPoint    = process.env.BASE_URL || 'http://localhost:3000';
var s3EndPoint  = 'https://s3-us-west-2.amazonaws.com/gyaon';

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
  var gyaonId = shortid.generate();
  res.redirect('/' + gyaonId);
});

router.get('/:gyaonId', function(req, res, next) {
  var gyaonId = req.params.gyaonId;
  res.render('index');
});

router.get('/getendpoint', function(req, res, next){
  res.send(endpoint);
})

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

//音声データをリダイレクト
router.get('/sounds/:id/:name:ext(.wav|.mp3)?', function(req, res){
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  res.redirect(s3EndPoint + "/" + gyaonId + "/" + fileName);
});

/* 音声データ受け取り */
router.post('/upload/:gyaonId', function(req, res) {
  promiseUploadDir().then(function() {
    var form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = "./public/tmp";
    form.parse(req, function(err, fields, files){
      debug(fields);
      var location = {x: fields.location_x, y: fields.location_y};
      model.promiseUploadSound(fields.gyaonId, location || '', files.file).then(function(sound){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).set("Content-Type", "application/json").json({
          endpoint: endPoint,
          object: sound
        }).end();
        req.app.get('socket.io').of('/post').emit(fields.gyaonId, { endpoint: endPoint ,object: sound });
      });
    });
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
  var key = `${gyaonId}/${fileName}`;
  debug(`delete ${key}`);
  model.promiseDeleteSound(gyaonId, fileName).then(function(){
    res.status(200).end();
    req.app.get('socket.io').of('/delete').emit(gyaonId, key);
  }).catch(function (err) { console.error(err.stack || err) });
});

/* herokuを寝かさない */
if(process.env.IS_HEROKU){
  setInterval(function(){
    request.head(endPoint)
  }, 1000 * 60 * 20)
}

module.exports = router;
