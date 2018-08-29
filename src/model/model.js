var db = require("./db");
var s3 = require("./s3");
var id = require("../util/id");
var fs = require("fs");
var debug = require("debug")("model");

exports.promiseGetUserInfo = function(gyaonId){
  return new Promise(function(resolve, reject){
    debug("get user info");
    db.promiseGetUserInfo(gyaonId).then(function(result){
      resolve(result);
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseGetSounds = function(gyaonId){
  return new Promise(function(resolve, reject){
    debug("get sounds");
    db.promiseGetSounds(gyaonId).then(function(sounds){
      resolve(sounds);
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseGetSoundsWithLocation = function(gyaonId){
  return new Promise(function(resolve, reject){
    debug("get sounds which have location data.");
    db.promiseGetSoundsWithLocation(gyaonId)
      .then(resolve)
      .catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseFindSound = function(name){
  return new Promise(function(resolve, reject){
    debug("find sound");
    db.promiseFind(name).then(function(sound){
      resolve(sound);
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseUploadSound = async function(gyaonId, location, file, extension, mime){
  return new Promise(function(resolve, result){
    fs.readFile(file.path, function(err, data){
      if(err) throw err;
      var fn = id.generate(gyaonId);
      var params = {
        Key: fn + extension,
        Body: data,
        ContentType: mime
      };
      s3.promiseUpload(params).then(function(data){
        db.promiseUpload(gyaonId, data, location, file.Size).then(function(sound){
          debug(`uploaded : ${sound}`);
          err ? resolve(err) : resolve(sound);
        }).catch(function (err) { console.error(err.stack || err) });
      }).catch(function (err) { console.error(err.stack || err) });
    });
    fs.unlink(file.path, function(err){
      if(err) throw err;
    });
  });
};

exports.promiseDeleteSound = function(name){
  return new Promise(function(resolve, result){
    s3.promiseDelete(name).then(function(){
      db.promiseDelete(name).then(function(){
        debug("deleted");
        resolve();
      }).catch(function (err) { console.error(err.stack || err) });
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseEditComment = function(name, text){
  return new Promise(function(resolve, result){
    db.promiseUpdateComment(name, text).then(function(){
      debug("complete edit comment");
      resolve();
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseLinkImage = (name, url) => {
  return new Promise((resolve, result) => [
    db.promiseLinkImage(name, url).then(() => {
      debug("complete link image");
      resolve()
    }).catch(err => { console.error(err.stack || err) })
  ])
};

exports.promiseUpdateLtsv = (gyaonId, path) => {
  return new Promise(function(resolve, result){

    fs.readFile(path, function(err, data){
      if(err) throw err;
      var params = {
        Key: `${gyaonId}.ltsv`,
        Body: data,
        ContentType: 'text/plain'
      };
      s3.promiseUpload(params).then(function(data){
        resolve(data.Location)
      }).catch(function (err) { console.error(err.stack || err) });
    });
    fs.unlink(path, function(err){
      if(err) throw err;
    });
  })
};
