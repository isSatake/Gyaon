var AWS = require('aws-sdk');
var filename = require('../util/filename');
var debug = require("debug")("s3bucket");

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = process.env.region;
var bucket = new AWS.S3({params: {Bucket: 'gyaon'}});
var endPoint = 'https://s3-us-west-2.amazonaws.com/gyaon/';

//MEMO DB入れるまでの措置
exports.promiseGetUserFileList = function(id){
  return new Promise(function(resolve, reject){
    var params = {Delimiter: '/', Prefix: id + '/'};
    bucket.listObjects(params, function(err, data){
      if(err) throw err;
      var files = [];
      data.Contents.forEach(function(file){
        files.push({name: file.Key.replace(id + '/', ''), url: endPoint + file.Key});
      });
      //降順ソート
      files.sort(function(a,b){
        if( a.name > b.name ) return -1;
        if( a.name < b.name ) return 1;
        return 0;
      });
      debug(files);
      resolve(err ? err : files);
    });
  });
}

exports.promiseUploadAndGetUrl = function(id, data){
  return new Promise(function(resolve, reject){
    var fn = filename.generate();
    var fileUrl;
    var params = {
      Key: id + "/" + fn,
      Body: data
    };
    bucket.upload(params, function(err, data) {
      if (err)
      console.error(err.stack || err);
      else
      fileUrl = data.Location;
      resolve({name: fn, url: fileUrl});
    });
  });
}

exports.deleteObject = function(params, callback){
  bucket.deleteObject(params, callback);
}
