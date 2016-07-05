var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var debug = require("debug")("index");
var cookie = require('cookie');
var mongoose = require('mongoose');
var id = require('../util/id');
var filename = require('../util/filename.js');
var AWS = require('aws-sdk');

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = process.env.region;
var bucket = new AWS.S3({params: {Bucket: 'gyaon'}});
var endPoint = 'https://s3-us-west-2.amazonaws.com/gyaon/';

mongoose.connect(
  process.env.MONGODB_URI
  || "mongodb://heroku_hlhb8pkb:hv9mijd72nlonst1gnmdhrr6i@ds011785.mlab.com:11785/heroku_hlhb8pkb"
  , function(err){
    if(err) throw err;
    debug("connected mongo");
  }
);

var soundSchema = mongoose.Schema({
  lastmodified: Date,
  user: String,
  name: String,
  key: String,
  size: Number,
  time: Number,
  memo: String,
  location: String
});

var Sound = mongoose.model('Sound', soundSchema);

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
  Sound.find({user: gyaonId}).sort({lastmodified: -1}).exec(function(err, docs){
    res.render('index', {
      id: gyaonId,
      endpoint: 'https://s3-us-west-2.amazonaws.com/gyaon/',
      fileList: docs
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
      fs.readFile(file.path, function(err, data){
        if(err) throw err;
        var fn = filename.generate();
        var params = {
          Key: gyaonId + "/" + fn,
          Body: data
        };
        bucket.upload(params, function(err, s3data) {
          if (err)
          console.error(err.stack || err);
          else
          res.status(200).set("Content-Type", "application/json").json({
            file: fn,
            url: s3data.Location
          }).end();
          new Sound({
            key: s3data.key,
            lastmodified: Date.now(),
            name: fn,
            size: file.size,
            user: s3data.key.split("/")[0]
          }).save(function(err){
            console.log("saved mongo");
          });
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
router.delete('/:id/:name', function(req, res){
  var gyaonId = req.params.id;
  var fileName = req.params.name;
  bucket.deleteObject({Key: `${gyaonId}/${fileName}`}, function(err, data){
    if(err) throw err;
    Sound.remove({key: `${gyaonId}/${fileName}`}, function(err, result){
      if(err) throw err;
      res.status(200).end();
    });
  });
});

module.exports = router;
