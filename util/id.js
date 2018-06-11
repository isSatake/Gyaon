const crypto = require('crypto');

const md5Hex = (src) => {
  const md5 = crypto.createHash('md5');
  md5.update(src, 'utf8');
  return md5.digest('hex');
};

exports.generate = (gyaonId) => {
  const seed = Math.random() * Date.now() + gyaonId;
  return md5Hex(String(seed));
};
