const toDoubleDigits = (num) => {
  num += ""
  return num.length === 1 ? "0" + num : num
}

export default (_date) => {
  const date = new Date(_date)
  const Y = date.getFullYear()
  const M = toDoubleDigits(date.getMonth() + 1)
  const D = toDoubleDigits(date.getDate())
  const h = toDoubleDigits(date.getHours())
  const m = toDoubleDigits(date.getMinutes())
  return `${Y}-${M}-${D} ${h}:${m}`
}
