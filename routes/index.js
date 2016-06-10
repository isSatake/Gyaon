var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var crypto = require('crypto');
var cookie = require('cookie');
var AWS = require('aws-sdk');

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = process.env.region;
var bucket = new AWS.S3({params: {Bucket: 'gyaon'}});

var s3EndPoint = 'https://s3-us-west-2.amazonaws.com/gyaon/';

var md5_hex = function(src) {
  var md5 = crypto.createHash('md5');
  md5.update(src, 'utf8');
  return md5.digest('hex');
}

var idGenerator = function() {
  var seed = Math.random() * Date.now();
  return md5_hex(String(seed));
}

//create tmp folder
var promiseUploadDir = function() {
  return new Promise(function(resolve, reject) {
    var dir = path.resolve("./public/tmp");
    fs.mkdir(dir, function(err) {
      err ? resolve(err) : resolve();
    });
  });
}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;
};

/* GET home page. */
router.get('/', function(req, res, next) {
  //cookie
  var gyaonId = req.cookies.gyaonId;
  if(typeof gyaonId === "undefined"){
    gyaonId = res.cookie('gyaonId', idGenerator());
  }
  debug("gyaonId : " + gyaonId);

  //get file list in s3
  var params = {Delimiter: '/', Prefix: gyaonId + '/'}
  bucket.listObjects(params, function(err, data){
    if(err) throw err;

    var files = [];
    data.Contents.forEach(function(file){
      files.push({name: file.Key.replace(gyaonId + '/', ''), url: s3EndPoint + file.Key});
    });
    //降順ソート
    files.sort(function(a,b){
      if( a.name > b.name ) return -1;
      if( a.name < b.name ) return 1;
      return 0;
    });
    debug(files);

    res.render('index', {
      title: 'Gyaon',
      fileList: files
    });
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
      var date = new Date();
      var y = date.getFullYear();
      var m = toDoubleDigits(date.getMonth() + 1);
      var d = toDoubleDigits(date.getDate());
      var h = toDoubleDigits(date.getHours());
      var min = toDoubleDigits(date.getMinutes());
      var s = toDoubleDigits(date.getSeconds());
      var fn = y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;

      //upload to s3
      fs.readFile(file.path, function(err, data){
        if(err) throw err;
        var keyName = gyaonId + "/" + fn
        var params = {Key: keyName, ContentType: file.type, Body: data};

        bucket.upload(params, function(err, data) {
          if (err)
          console.log(err)
          else
          var fileUrl = data.Location;
          debug("Successfully uploaded data to " + fileUrl);
          res.status(200).set("Content-Type", "application/json").json({
            file: fn,
            url: fileUrl
          }).end();

          //delete tmp file
          fs.unlink(file.path, function(err){
            if(err) throw err;
          });
        });
      });
    });
    form.parse(req);
  }).catch(debug)
});

router.delete('/:id', function(req, res){
  var gyaonId = req.cookies.gyaonId;
  var fileName = req.params.id;
  console.log(gyaonId + "/" + fileName);
  bucket.deleteObject({Key: gyaonId + "/" + fileName}, function(err, data){
    if(err) throw err;
    res.status(200).end();
  });
});

module.exports = router;
