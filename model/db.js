var mongoose = require('mongoose');
var debug = require("debug")("db");

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI
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
  comment: String,
  location_x: Number,
  location_y: Number
});

var Sound = mongoose.model('Sound', soundSchema);

var createSound = function(s3Data, location, file){
  debug("createSound");
  debug(location.x);
  var now = new Date;
  return new Sound({
    key: s3Data.key,
    lastmodified: Date.now(),
    name: s3Data.key.split("/")[1],
    size: file.size,
    user: s3Data.key.split("/")[0],
    location_x: location.x,
    location_y: location.y
  })
}

exports.promiseGetSounds = function(gyaonId){
  return new Promise(function(resolve, result){
    debug(`find : ${gyaonId}`);
    Sound.find({user: gyaonId}).sort({lastmodified: -1}).exec(function(err, sounds){
      debug(sounds);
      err ? resolve(err) : resolve(sounds);
    });
  });
}

exports.promiseGetSoundsWithLocation = function(gyaonId){
  return new Promise(function(resolve, result){
    debug(`find : ${gyaonId} `);
    var query = {
      user: gyaonId,

      location_x: {
        $exists: true
      },
      location_y: {
        $exists: true
      }
    };
    Sound.find(query).sort({lastmodified: -1}).exec(function(err, sounds){
      debug(sounds);
      err ? resolve(err) : resolve(sounds);
    });
  });
}

exports.promiseFind = function(gyaonId, name){
  return new Promise(function(resolve, result){
    debug(`find : ${gyaonId}/${name}`);
    var _key = `${gyaonId}/${name}`;
    Sound.find({key: _key}).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve(sound);
    });
  });
}

exports.promiseUpload = function(s3Data, location, file){
  return new Promise(function(resolve, result){
    createSound(s3Data, location, file).save(function(err, sound){
      debug("uploaded");
      err ? resolve(err) : resolve(sound);
    });
  });
}

exports.promiseDelete = function(gyaonId, name){
  return new Promise(function(resolve, result){
    debug(`delete : ${gyaonId}/${name}`);
    var _key = `${gyaonId}/${name}`;
    Sound.remove({key: _key}, function(err, result){
      debug("deleted");
      err ? resolve(err) : resolve();
    });
  });
}

exports.promiseUpdateComment = function(gyaonId, name, text){
  return new Promise(function(resolve, result){
    var _key = `${gyaonId}/${name}`;
    debug(`comment on ${_key} : ${text}`);
    Sound.update(
      {key: _key},
      {$set: {comment: text}
    }).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve();
    });
  });
}
