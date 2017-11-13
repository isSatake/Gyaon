const map = {
  '01': '☀️',
  '02': '☀️',
  '03': '⛅️',
  '04': '☁️',
  '09': '🌧',
  '10': '☔️',
  '11': '⛈',
  '13': '❄️',
  '50': '☁️'
}

module.exports = function(weatherIconId){
  const id = weatherIconId.substr(0, 2)
  console.log(id)
  return map[id];
};
