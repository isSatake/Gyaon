var fs = require('fs');
var format = require('date-format')
var model = require('../model/model')
var weatherToEmoji = require('../util/weather')

exports.promiseSaveLtsv = (gyaonId) => {
  return new Promise(function(resolve, result){
    model.promiseGetSounds(gyaonId).then(function(result){
      const path = `./public/${gyaonId}.ltsv`
      let ltsv = `title:${gyaonId}'s Gyaon\n`
      let curyear = ''
      let curmonth = ''
      let curday = ''

      result.forEach(function(item){
        const year = format('yyyy', item.lastmodified)
        const month = format('MM', item.lastmodified)
        const day = format('dd', item.lastmodified)
        const pageTitle = `${format('yyyy-MM-dd hh:mm:ss', item.lastmodified)}`
        const ltsvTitle = `${format('hh : mm : ss', item.lastmodified)}`
        const mapimg = item.mapimg ? `[${item.mapimg}]` : ''
        const img = item.img ? `[${item.img}]` : ''
        const weather = item.weatherIcon ? `[${weatherToEmoji(item.weatherIcon)}]` : ''
        const bookmarkUrl = item.url ? item.url : ''
        let address = ''
        let indent = ' '

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

        const url = `https://scrapbox.io/${gyaonId}-gyaon/${pageTitle}?body=` +
          encodeURIComponent(
            `${img}    ${mapimg}\n `+
            `[音声 https://gyaon.herokuapp.com/sounds/${item.key.split('.')[0]}.mp3]\n` +
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

      fs.writeFile(path, ltsv, function(err){
        if(err) resolve(err);
        resolve(path)
      })
    })
  })
}
