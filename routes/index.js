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
var formatDate = require('../util/formatdate');
var weather = require('../util/weather');
var scrapbox = require('../util/scrapbox');

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

router.get('/:gyaonId', function (req, res, next) {
  res.render('index');
});

router.get('/getendpoint', function (req, res, next) {
  res.send(endpoint);
})

router.get('/info/:gyaonId', function(req, res, next){
  model.promiseGetUserInfo(req.params.gyaonId).then(function(result){
    res.send(result)
  }).catch(function (err) {
    console.error(err.stack || err)
  });
})

router.get('/sounds/:gyaonId', function (req, res) {
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

//音声データをリダイレクト
router.get('/sounds/:id/:name', function (req, res) {
  var gyaonId = req.params.id;
  var fileName = req.params.name.split('.')[0];
  model.promiseFindSound(gyaonId, fileName).then(function(sound){
    res.redirect(s3EndPoint + "/" + gyaonId + "/" + sound[0].name);
  })
});

//音声リストのltsv
router.get('/ltsv/:id.ltsv', function(req, res) {
  var gyaonId = req.params.id
  model.promiseGetSounds(gyaonId).then(function(result){
    var ltsv = "title:" + gyaonId + "'s Gyaon"
    result.forEach(function(item){
      ltsv += '\n title:' + formatDate(item.lastmodified) + '\turl:' + endPoint + '/sounds/' + item.key
    })

    fs.writeFile('./public/' + gyaonId + '.ltsv', ltsv, function(err){
      if(err) console.error(err)
      console.log('done')
      res.redirect(endPoint + "/" + gyaonId + ".ltsv");
    })
  })
})


/* 音声データ受け取り */
const upload = multer({dest: path.resolve("./public/tmp")})
router.post('/upload/:id', upload.single('file'), function (req, res) {
  var gyaonId = req.params.id
  var location = {lat: req.body.lat, lon: req.body.lon}
  var extension = '.' + req.file.originalname.split('.').pop() || '.wav'
  var mime = req.file.mimetype || 'audio/wav'

  scrapbox.promiseGetRatestPage(gyaonId).then(function(url){
    weather.promiseGetWeatherIcon(location).then(function(weatherIconId){
      model.promiseUploadSound(gyaonId, location, weatherIconId, url, req.file, extension, mime).then(function (sound) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(JSON.stringify({
          ok: true,
          endpoint: endPoint,
          object: sound
        }))
        req.app.get('socket.io').of('/post').emit(gyaonId, {endpoint: endPoint, object: sound});
      });
    })
  })
})

/* コメント編集 */
router.post('/comment/:id/:name', function (req, res) {
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  var text = req.body.value;
  debug(`comment on ${gyaonId}/${fileName} : ${text}`);
  model.promiseEditComment(gyaonId, fileName, text).then(function () {
    res.status(200).end();
  });
});

router.post('/scrapbox/:id', function(req, res){
  var gyaonId = req.params.id;
  var scrapboxTitle = req.body.title;
  debug(`${gyaonId}'s scrapbox: ${scrapboxTitle}`); //TODO 作り込み
  model.promiseConfigScrapbox(gyaonId, scrapboxTitle).then(function(){
    res.status(200).end();
  })
})

/* 音声削除 */
router.delete('/:id/:name', function (req, res) {
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  var key = `${gyaonId}/${fileName}`;
  debug(`delete ${key}`);
  model.promiseDeleteSound(gyaonId, fileName).then(function () {
    res.status(200).end();
    req.app.get('socket.io').of('/delete').emit(gyaonId, key);
  }).catch(function (err) {
    console.error(err.stack || err)
  });
});

/* herokuを寝かさない */
if (process.env.IS_HEROKU) {
  setInterval(function () {
    request.head(endPoint)
  }, 1000 * 60 * 20)
}

module.exports = router;
