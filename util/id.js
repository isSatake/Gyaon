var crypto = require('crypto');

var md5Hex = function(src) {
  var md5 = crypto.createHash('md5');
  md5.update(src, 'utf8');
  return md5.digest('hex');
}

exports.generate = function(gyaonId){
  var seed = Math.random() * Date.now() + gyaonId;
  return md5Hex(String(seed));
}
