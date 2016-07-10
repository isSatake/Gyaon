var db = require("./db");
var s3 = require("./s3");
var id = require("../util/id");
var fs = require("fs");
var debug = require("debug")("model");

var promiseGetRecordDates = function(gyaonId){
  return new Promise(function(resolve, reject){
    debug("get record dates");
    db.promiseGetRecordDates(gyaonId).then(function(dates){
      debug(dates);
      resolve(dates);
    }).catch(function (err) { console.error(err.stack || err) });
  });
};

exports.promiseGetSoundsEachDay = function(gyaonId){
  return new Promise(function(_resolve, _reject){
    debug("get sounds each day");
    promiseGetRecordDates(gyaonId).then(function(_dates){
      var dates = _dates;
      var promises = [];
      dates.forEach(function(date, index){
        promises.push(
          new Promise(function(resolve, reject){
            db.promiseGetSoundsByDate(gyaonId, date).then(function(_sounds){
              dates[index].sounds = _sounds;
              resolve();
            }).catch(function (err) { console.error(err.stack || err) });
          })
        );
      });
      Promise.all(promises).then(function(){
        debug(dates);
        _resolve(dates);
      }).catch(function (err) { console.error(err.stack || err) });
    });
  });
};

exports.promiseUploadSound = function(gyaonId, file){
  return new Promise(function(resolve, result){
    fs.readFile(file.path, function(err, data){
      if(err) throw err;
      var fn = id.generate();
      var params = {
        Key: gyaonId + "/" + fn,
        Body: data
      };
      s3.promiseUpload(params).then(function(data){
        db.promiseUpload(data, fn, file).then(function(sound){
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

exports.promiseDeleteSound = function(key){
  return new Promise(function(resolve, result){
    s3.promiseDelete(key).then(function(){
      db.promiseDelete(key).then(function(){
        debug("deleted");
        resolve();
      }).catch(function (err) { console.error(err.stack || err) });
    }).catch(function (err) { console.error(err.stack || err) });
  });
}
