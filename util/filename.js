var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;
};

exports.generate = function(){
  var date = new Date();
  var y = date.getFullYear();
  var m = toDoubleDigits(date.getMonth() + 1);
  var d = toDoubleDigits(date.getDate());
  var h = toDoubleDigits(date.getHours());
  var min = toDoubleDigits(date.getMinutes());
  var s = toDoubleDigits(date.getSeconds());
  return y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;
}
