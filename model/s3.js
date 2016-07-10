var AWS = require('aws-sdk');
var debug = require("debug")("s3");

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = process.env.region;
var bucket = new AWS.S3({params: {Bucket: 'gyaon'}});

exports.promiseUpload = function(params){
  return new Promise(function(resolve, reject){
    bucket.upload(params, function(err, data) {
      debug("uploaded");
      err ? resolve(err) : resolve(data);
    });
  });
}

exports.promiseDelete = function(_key){
  return new Promise(function(resolve, reject){
    bucket.deleteObject({Key: _key}, function(err, data){
      debug("deleted");
      err ? resolve(err) : resolve();
    });
  });
}
