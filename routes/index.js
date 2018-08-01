var express = require('express');
var router = express.Router();

var Request = require('superagent');
var fs = require('fs');
var path = require('path');
var shortid = require('shortid');
var formidable = require('formidable');
var debug = require("debug")("index");
var multer = require("multer");

var model = require('../model/model');
var s3 = require("../model/s3");
var ltsv = require('../util/ltsv');

var endPoint = process.env.BASE_URL || 'http://localhost:3000';
var s3EndPoint = 'https://s3-us-west-2.amazonaws.com/gyaon';

//create tmp folder
var promiseUploadDir = () => {
  return new Promise((resolve, reject) => {
    var dir = path.resolve("./public/tmp");
    fs.mkdir(dir, err => {
      err ? resolve(err) : resolve();
    });
  });
};

router.get('/', (req, res, next) => {
  var gyaonId = shortid.generate();
  res.redirect('/' + gyaonId);
});

// 'GET /:gyaonId より先に定義しないといけない'
router.get('/:gyaonId.ltsv', (req, res, next) => {
  ltsv.promiseGetLtsv(endPoint, req.params.gyaonId).then(result => {
    res.send(result)
  }).catch(err => console.error(err.stack || err))
});

router.get('/:gyaonId', (req, res, next) => {
  res.sendfile('./views/index.html')
});

router.get('/getendpoint', (req, res, next) => {
  res.send(endpoint);
});

router.get('/user/:gyaonId', (req, res) => {
  //ユーザの音声リストを返却
  var gyaonId = req.params.gyaonId;
  model.promiseGetSounds(gyaonId).then((result) => {
    res.send({
      endpoint: endPoint,
      sounds: result
    });
  }).catch((err) => {
    console.error(err.stack || err)
  });
});

const getSound = (name, req, res) => {
  model.promiseFindSound(name.split('.')[0]).then((sound) => {
    if (!sound[0]) {
      res.status(404).end();
    }
    res.writeHead(200, {'Content-Type': 'audio/wav'})
    const fileStream = s3.getFileStream(sound[0].name)
    fileStream.pipe(res)
  })
};

//音声データをリダイレクト(旧)
router.get('/sounds/:id/:name', (req, res) => {
  getSound(req.params.name, req, res)
});

//音声データをリダイレクト
router.get('/sound/:name', (req, res) => {
  getSound(req.params.name, req, res)
});

/* 音声データ受け取り */
const upload = multer({dest: path.resolve("./public/tmp")});
router.post('/upload/:gyaonId', upload.single('file'), (req, res) => {
  var gyaonId = req.params.gyaonId;
  var location = {lat: req.body.lat, lon: req.body.lon};
  var extension = '.' + req.file.originalname.split('.').pop() || '.wav';
  var mime = req.file.mimetype || 'audio/wav';

  model.promiseUploadSound(gyaonId, location, req.file, extension, mime).then((sound) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify({
      ok: true,
      endpoint: endPoint,
      object: sound
    }));
    req.app.get('socket.io').of('/post').emit(gyaonId, {endpoint: endPoint, object: sound});
  });
});

/* コメント編集 */
router.post('/comment/:name', (req, res) => {
  var fileName = req.params.name;
  var text = req.body.value;
  debug(`comment on ${fileName} : ${text}`);
  model.promiseEditComment(fileName, text).then(() => {
    res.status(200).end();
  });
});

/* 画像とリンク */
router.post('/image/:name/', (req, res) => {
  var fileName = req.params.name;
  var imgUrl = req.body.imgurl;
  model.promiseLinkImage(fileName, imgUrl).then(() => {
    res.status(200).end();
  });
});

/* 音声削除 */
router.delete('/:gyaonId/:name', (req, res) => {
  const gyaonId = req.params.gyaonId;
  var fileName = req.params.name;
  debug(`delete ${fileName}`);
  model.promiseDeleteSound(fileName).then(() => {
    res.status(200).end();
    req.app.get('socket.io').of('/delete').emit(gyaonId, fileName)
  }).catch((err) => {
    console.error(err.stack || err)
  })
});

module.exports = router;
