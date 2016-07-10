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
  year: Number,
  month: Number,
  date: Number,
  hour: Number,
  minute: Number,
  second: Number,
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
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    name: s3Data.key.split("/")[1],
    size: file.size,
    user: s3Data.key.split("/")[0]
  })
}

exports.promiseGetRecordDates = function(gyaonId){
  return new Promise(function(resolve, reject){
    debug("get record dates");
    Sound.aggregate([
      { $match: { user: gyaonId }},
      { $project: {
        ymd: {
          year: { $year: "$lastmodified" },
          month: { $month: "$lastmodified" },
          date: { $dayOfMonth: "$lastmodified" }
        }
      }},
      { $group: { _id: "$ymd" }},
      { $sort: { _id: -1 }}
    ], function(err, dates){
      debug(dates);
      err ? resolve(err) : resolve(dates);
    });
  });
}

exports.promiseGetSoundsByDate = function(gyaonId, date){
  return new Promise(function(resolve, result){
    debug(`find : ${date}`);
    var params = {
      user: gyaonId,
      year: date._id.year,
      month: date._id.month,
      date: date._id.date
    }
    Sound.find(params).sort({lastmodified: -1}).exec(function(err, sounds){
      debug(sounds);
      err ? resolve(err) : resolve(sounds);
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
