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
router.get('/:id/location', function(req, res){
  var gyaonId = req.params.id;
  var location_1 = {x: req.query.x1, y: req.query.y1};
  var location_2 = {x: req.query.x2, y: req.query.y2};
  debug(`get sounds by location`);
  model.promiseGetSoundsByLocation(gyaonId, location_1, location_2)
       .then(function(sounds){
         res.send(sounds);
       })
       .catch(function (err) { console.error(err.stack || err) });
});

module.exports = router;
