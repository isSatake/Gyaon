var db = require("./db");
var s3 = require("./s3");
var id = require("../util/id");
var fs = require("fs");
var debug = require("debug")("model");

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

exports.promiseFindSound = function(gyaonId, name){
  return new Promise(function(resolve, reject){
    debug("find sound");
    db.promiseFind(gyaonId, name).then(function(sound){
      resolve(sound);
    }).catch(function (err) { console.error(err.stack || err) });
  });
}

exports.promiseUploadSound = function(gyaonId, location, file, extension, mime){
  return new Promise(function(resolve, result){
    fs.readFile(file.path, function(err, data){
      if(err) throw err;
      var fn = id.generate();
      var params = {
        Key: gyaonId + "/" + fn + extension,
        Body: data,
        ContentType: mime
      };
      s3.promiseUpload(params).then(function(data){
        db.promiseUpload(data, location, file).then(function(sound){
          debug(`uploaded : ${sound}`);
          err ? resolve(err) : resolve(sound);
        }).catch(function (err) { console.error(err.stack || err) });
      }).catch(function (err) { console.error(err.stack || err) });
    });
    fs.unlink(file.path, function(err){
      if(err) throw err;
    });
  });
}

exports.promiseDeleteSound = function(gyaonId, name){
  return new Promise(function(resolve, result){
    s3.promiseDelete(gyaonId, name).then(function(){
      db.promiseDelete(gyaonId, name).then(function(){
        debug("deleted");
        resolve();
      }).catch(function (err) { console.error(err.stack || err) });
    }).catch(function (err) { console.error(err.stack || err) });
  });
}

exports.promiseEditComment = function(gyaonId, name, text){
  return new Promise(function(resolve, result){
    db.promiseUpdateComment(gyaonId, name, text).then(function(){
      debug("complete edit comment");
      resolve();
    }).catch(function (err) { console.error(err.stack || err) });
  });
}
