var toDoubleDigits = function(num){
  num += "";
  if(num.length === 1){
    num = "0" + num;
  }
  return num;
}

module.exports = function(date){
  var Y = date.getFullYear();
  var M = toDoubleDigits(date.getMonth() + 1);
  var D = toDoubleDigits(date.getDate());
  var h = toDoubleDigits(date.getHours());
  var m = toDoubleDigits(date.getMinutes());
  return `${Y}-${M}-${D} ${h}:${m}`;
};
