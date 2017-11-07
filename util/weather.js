var weather = require('openweather-apis');
weather.setLang('jp');
weather.setUnits('metric');
weather.setAPPID('be432f85fd4c709847933515dc5897fc');

exports.promiseGetWeatherIcon = function(location){
  return new Promise(function(resolve, result){
    weather.setCoordinate(location.lat, location.lon);
    weather.getAllWeather(function(err, JSONObj){
      err ? resolve(err) : resolve(JSONObj.weather[0].icon)
    });
  });
}
