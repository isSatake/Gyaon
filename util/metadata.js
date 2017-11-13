var weather = require('openweather-apis');
var Request = require('superagent');
var model = require('../model/model');

weather.setLang('jp');
weather.setUnits('metric');
weather.setAPPID('be432f85fd4c709847933515dc5897fc');

const YAHOOID = 'dj00aiZpPUlkb3JBNlFnWUF0dyZzPWNvbnN1bWVyc2VjcmV0Jng9MWM-'

exports.promiseGetMetadata = function(gyaonId, location){
  return new Promise(function(resolve, result){
    let obj = {
      weatherIconId: '',
      url: '',
      address: ''
    }
    promiseGetWeatherIcon(location)
      .then(icon => promiseGetRatestPage(gyaonId)
        .then(url => promiseGetAddress(location)
          .then(address => {
            obj.weatherIconId = icon
            obj.url = url
            obj.address = address
            resolve(obj)
          }))).catch(err => resolve(err))
  })
}

const promiseGetWeatherIcon = function(location){
  return new Promise(function(resolve, result){
    weather.setCoordinate(location.lat, location.lon);
    weather.getAllWeather(function(err, JSONObj){
      err ? resolve(err) : resolve(JSONObj.weather[0].icon)
    });
  });
}

const promiseGetRatestPage = function(gyaonId){
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
      resolve('');
    });
  });
}

const promiseGetAddress = function(location){
  return new Promise(function(resolve, result){
    Request
      .get(`https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder?lat=${location.lat}&lon=${location.lon}&output=json&appid=${YAHOOID}`)
      .then(res => {
        resolve(res.body.Feature[0].Property.Address)
      }).catch(err => resolve(err))
  });
}
