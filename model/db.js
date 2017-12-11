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
  key: String,
  user: String,
  name: String,
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

var createSound = function(gyaonId, s3Data, location, fileSize){
  debug("createSound");
  debug(s3Data);
  var now = new Date;
  return new Sound({
    lastmodified: Date.now(),
    key: s3Data.key,
    name: s3Data.key,
    size: fileSize,
    user: gyaonId,
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
        {name: sound.name},
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

exports.promiseUpload = function(gyaonId, s3Data, location, fileSize){
  return new Promise(function(resolve, result){
    createSound(gyaonId, s3Data, location, fileSize).save(function(err, sound){
      debug("uploaded");
      err ? resolve(err) : resolve(sound);
      promiseAddMetadata(sound).then().catch(err => console.error(err))
    });
  });
}

exports.promiseDelete = function(name){
  return new Promise(function(resolve, result){
    debug(`delete : ${name}`);
    Sound.remove({name: name}, function(err, result){
      debug("deleted");
      err ? resolve(err) : resolve();
    });
  });
}

exports.promiseUpdateComment = function(name, text){
  return new Promise(function(resolve, result){
    debug(`comment on ${name} : ${text}`);
    Sound.update(
      {name: name},
      {$set: {comment: text}}
    ).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve();
    });
  });
}

exports.promiseLinkImage = (name, url) => {
  return new Promise((resolve, result) => {
    debug(`link ${url} to ${name}`);
    Sound.update(
      {name: name},
      {$set: {img: url}}
    ).exec(function(err, sound){
      debug(sound);
      err ? resolve(err) : resolve();
    });
  })
}
