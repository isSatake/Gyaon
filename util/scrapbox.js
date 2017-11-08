var Request = require('superagent');
var model = require('../model/model');

exports.promiseGetRatestPage = function(gyaonId){
  return new Promise(function(resolve, result){
    model.promiseGetUserInfo(gyaonId).then(function(result){
      // resolve(result.scrapbox);
      //APIを叩く
      var project = result[0].scrapbox
      Request
        .get(`https://scrapbox.io/api/pages/${project}?limit=100`)
        .then(res => {
          if(Math.floor(Date.now() / 1000) - res.body.pages[0].updated < 3600){
            resolve(`https://scrapbox.io/${project}/${res.body.pages[0].title}`)
          }else{
            resolve()
          }
        })
        .catch(err => console.error(err))
    }).catch(function (err) {
      resolve(err);
    });
  });
}
