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
  model.promiseGetSounds(gyaonId).then(function(result){
    res.render('map', {
      id: gyaonId,
      endpoint: endPoint,
      sounds: result,
      format: formatDate
    });
  }).catch(function (err) { console.error(err.stack || err) });
}

router.get('/', function(req, res) {
  var gyaonId = shortid.generate();
  index(req, res, gyaonId);
});

router.get('/:id', function(req, res) {
  var gyaonId = req.params.id;
  index(req, res, gyaonId);
});

module.exports = router;
