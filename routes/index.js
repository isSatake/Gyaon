var express = require('express');
var router = express.Router();

var request = require('request');
var fs = require('fs');
var path = require('path');
var shortid = require('shortid');
var formidable = require('formidable');
var debug = require("debug")("index");
var multer = require("multer")

var model = require('../model/model');
var ltsv = require('../util/ltsv')

var endPoint = process.env.BASE_URL || 'http://localhost:3000';
var s3EndPoint = 'https://s3-us-west-2.amazonaws.com/gyaon';

//create tmp folder
var promiseUploadDir = function () {
  return new Promise(function (resolve, reject) {
    var dir = path.resolve("./public/tmp");
    fs.mkdir(dir, function (err) {
      err ? resolve(err) : resolve();
    });
  });
}

router.get('/', function (req, res, next) {
  var gyaonId = shortid.generate();
  res.redirect('/' + gyaonId);
});

// 'GET /:gyaonId より先に定義しないといけない'
router.get('/:gyaonId.ltsv', function(req, res, next){
  ltsv.promiseGetLtsv(endPoint, req.params.gyaonId).then(result => {
    res.send(result)
  }).catch(err => console.error(err.stack || err))
})

router.get('/:gyaonId', function (req, res, next) {
  var gyaonId = req.params.gyaonId
  res.render('index');
});

router.get('/getendpoint', function (req, res, next) {
  res.send(endpoint);
})

router.get('/user/:gyaonId', function (req, res) {
  //ユーザの音声リストを返却
  var gyaonId = req.params.gyaonId
  model.promiseGetSounds(gyaonId).then(function (result) {
    res.send({
      endpoint: endPoint,
      sounds: result
    });
  }).catch(function (err) {
    console.error(err.stack || err)
  });
});

const getSound = (name, req, res) => {
  model.promiseFindSound(name.split('.')[0]).then((sound) => {
    res.redirect(s3EndPoint + "/" + sound[0].name)
  })
}

//音声データをリダイレクト(旧)
router.get('/sounds/:id/:name', (req, res) => {
  getSound(req.params.name, req, res)
});

//音声データをリダイレクト
router.get('/sound/:name', (req, res) => {
  getSound(req.params.name, req, res)
});

/* 音声データ受け取り */
const upload = multer({dest: path.resolve("./public/tmp")})
router.post('/upload/:gyaonId', upload.single('file'), function (req, res) {
  var gyaonId = req.params.gyaonId
  var location = {lat: req.body.lat, lon: req.body.lon}
  var extension = '.' + req.file.originalname.split('.').pop() || '.wav'
  var mime = req.file.mimetype || 'audio/wav'

  model.promiseUploadSound(gyaonId, location, req.file, extension, mime).then(function (sound) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify({
      ok: true,
      endpoint: endPoint,
      object: sound
    }))
    req.app.get('socket.io').of('/post').emit(gyaonId, {endpoint: endPoint, object: sound});
  });
})

/* コメント編集 */
router.post('/comment/:name', function (req, res) {
  var fileName = req.params.name;
  var text = req.body.value;
  debug(`comment on ${fileName} : ${text}`);
  model.promiseEditComment(fileName, text).then(function () {
    res.status(200).end();
  });
});

/* 画像とリンク */
router.post('/image/:name/', function(req, res) {
  var fileName = req.params.name;
  var imgUrl = req.body.imgurl;
  model.promiseLinkImage(fileName, imgUrl).then(() => {
    res.status(200).end();
  });
});

/* 音声削除 */
router.delete('/:gyaonId/:name', function (req, res) {
  const gyaonId = req.params.gyaonId
  var fileName = req.params.name
  debug(`delete ${fileName}`)
  model.promiseDeleteSound(fileName).then(function () {
    res.status(200).end()
    req.app.get('socket.io').of('/delete').emit(gyaonId, fileName)
  }).catch(function (err) {
    console.error(err.stack || err)
  })
})

module.exports = router;
