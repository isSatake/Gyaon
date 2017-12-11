var format = require('date-format')
var model = require('../model/model')
var weatherToEmoji = require('../util/weather')

exports.promiseGetLtsv = (endPoint, gyaonId) => {
  return new Promise(function(resolve, result){
    model.promiseGetSounds(gyaonId).then(function(result){
      let ltsv = ''
      let curyear = ''
      let curmonth = ''
      let curday = ''

      result.forEach(function(item){
        const year = format('yyyy', item.lastmodified)
        const month = format('MM', item.lastmodified)
        const day = format('dd', item.lastmodified)
        const pageTitle = `${format('yyyy-MM-dd hh:mm:ss', item.lastmodified)}`
        const ltsvTitle = `${format('hh : mm : ss', item.lastmodified)}`
        const images = item.img ? `[${item.img}] [${item.mapimg}]` : `[${item.mapimg}]`
        const weather = item.weatherIcon ? `${weatherToEmoji(item.weatherIcon)}` : ''
        const bookmarkUrl = item.url ? item.url : ''
        let address = ''
        let indent = ''

        if(curyear != year){
          ltsv += `${indent}title:${year}年\n`
          curyear = year
        }
        indent += ' '
        if(curmonth != month){
          ltsv += `${indent}title:${month}月\n`
          curmonth = month
        }
        indent += ' '
        if(curday != day){
          ltsv += `${indent}title:${month}/${day}\n`
          curday = day
        }

        if(item.address){
          item.address.split(',').forEach(element => {
            if(element){
              address += '[' + element + ']'
            }
          })
        }

        const url = `https://scrapbox.io/${gyaonId}/${pageTitle}?body=` +
          encodeURIComponent(
            `${images}\n `+
            `[音声 ${endPoint}/sounds/${item.key.split('.')[0]}.mp3]\n` +
            '[* コメント]\n' +
            ` ${item.comment}\n` +
            '[* 天気]\n' +
            ` ${weather}\n` +
            '[* 位置]\n' +
            ` ${address}付近\n` +
            '[* 日時]\n' +
            ` [${year}-${month}]-${format('dd hh:mm:ss', item.lastmodified)}\n`
          )

        indent += ' '
        ltsv += `${indent}title:${ltsvTitle}\turl:${url}\n`
      })

      resolve(ltsv)
    }).catch(err => resolve(err))
  })
}
