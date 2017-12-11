var mongoose = require('mongoose');
var fs = require('fs');
var metadata = require('../util/metadata');
var weatherToEmoji = require('../util/weather');
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
  lat: Number,
  lon: Number,
  weatherIcon: String,
  url: String,
  address: String,
  mapimg: String,
  img: String
});

var userSchema = mongoose.Schema({
  id: String,
  scrapbox: String
})

var Sound = mongoose.model('Sound', soundSchema);
var User = mongoose.model('User', userSchema)

var createSound = function(s3Data, location, fileSize){
  debug("createSound");
  debug(s3Data);
  var now = new Date;
  return new Sound({
    key: s3Data.key,
    lastmodified: Date.now(),
    name: s3Data.key.split("/")[1],
    size: fileSize,
    user: s3Data.key.split("/")[0],
    comment: "",
    lat: location.lat,
    lon: location.lon,
  })
}

var createUser = function(id, scrapbox){
  debug("createUser");
  return new User({
    id: id,
    scrapbox: scrapbox
  })
}

const promiseAddMetadata = (sound) => {
  return new Promise(function(resolve, result){
    debug('addMetadata')
    const location = {lat: sound.lat, lon: sound.lon}
    metadata.promiseGetMetadata(sound.user, location).then(obj => {
      Sound.update(
        {key: sound.key},
        {$set: {
          weatherIcon: obj.weatherIconId,
          url: obj.url,
          address: obj.address,
          mapimg: obj.mapimg
        }}
      ).exec(function(err, sound){
        err ? resolve(err) : resolve(obj)
      });
    })
  })
}

exports.promiseGetUserInfo = function(gyaonId){
  return new Promise(function(resolve, result){
    debug(`${gyaonId}'s info'`);
    User.find({id: gyaonId}).exec(function(err, info){
      debug(info);
      err ? resolve(err) : resolve(info);
    });
  });
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

exports.promiseFind = function(name){
  return new Promise(function(resolve, result){
    debug(`find : ${name}`);
    var regexp = new RegExp(`${name}.*`)
    Sound.find({name:regexp}).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve(sound);
    });
  });
}

exports.promiseUpload = function(s3Data, location, fileSize){
  return new Promise(function(resolve, result){
    createSound(s3Data, location, fileSize).save(function(err, sound){
      debug("uploaded");
      err ? resolve(err) : resolve(sound);
      promiseAddMetadata(sound).then().catch(err => console.error(err))
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
      {$set: {comment: text}}
    ).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve();
    });
  });
}

exports.promiseLinkImage = (gyaonId, name, url) => {
  return new Promise((resolve, result) => {
    var _key = `${gyaonId}/${name}`;
    debug(`link ${url} to ${_key}`);
    Sound.update(
      {key: _key},
      {$set: {img: url}}
    ).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve();
    });
  })
}
