var express     = require('express');
var router      = express.Router();

var request     = require('request');
var fs          = require('fs');
var path        = require('path');
var shortid     = require('shortid');
var formidable  = require('formidable');
var debug       = require("debug")("map");

var model       = require('../model/model');
var formatDate  = require('../util/formatdate');

var endPoint    = process.env.BASE_URL || 'http://localhost:3000';
var s3EndPoint  = 'https://s3-us-west-2.amazonaws.com/gyaon';

/* Gyaon Map */
var index = function(req, res, gyaonId){
  debug("gyaonId : " + gyaonId);
  res.render('map', {
    id: gyaonId,
    endpoint: endPoint
  });
}

router.get('/', function(req, res) {
  var gyaonId = shortid.generate();
  index(req, res, gyaonId);
});

router.get('/:id', function(req, res) {
  var gyaonId = req.params.id;
  index(req, res, gyaonId);
});

//音声リストを返す
router.get('/sounds/:id', function(req, res){
  var gyaonId = req.params.id;
  debug(`get sounds which have location data.`);
  model.promiseGetSoundsWithLocation(gyaonId)
       .then(function(sounds){
         res.send({
           endpoint: endPoint,
           sounds: sounds
         });
       })
       .catch(function (err) { console.error(err.stack || err) });
});

//解説ページ
router.get('/document/about', function(req, res){
  res.render('map-about');
});

//操作方法ページ
router.get('/document/howto', function(req, res){
  res.render('map-howto');
});

module.exports = router;
