var mongoose = require('mongoose');
var debug = require("debug")("db");

mongoose.connect(
  process.env.MONGODB_URI
  || "mongodb://heroku_hlhb8pkb:hv9mijd72nlonst1gnmdhrr6i@ds011785.mlab.com:11785/heroku_hlhb8pkb"
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
  memo: String,
  location: String
});

var Sound = mongoose.model('Sound', soundSchema);

var createSound = function(s3Data, file){
  debug("createSound");
  var now = new Date;
  return new Sound({
    key: s3Data.key,
    lastmodified: Date.now(),
    name: s3Data.key.split("/")[1],
    size: file.size,
    user: s3Data.key.split("/")[0]
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

exports.promiseUpload = function(s3Data, fileName, file){
  return new Promise(function(resolve, result){
    createSound(s3Data, fileName, file).save(function(err, sound){
      debug("uploaded");
      err ? resolve(err) : resolve(sound);
    });
  });
}

exports.promiseDelete = function(_key){
  return new Promise(function(resolve, result){
    Sound.remove({key: _key}, function(err, result){
      debug("deleted");
      err ? resolve(err) : resolve();
    });
  });
}
