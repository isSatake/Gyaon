var fs = require('fs');
var model = require('../model/model');
var formatDate = require('../util/formatdate');
var weatherToEmoji = require('../util/weather');

exports.promiseSaveLtsv = (gyaonId) => {
  return new Promise(function(resolve, result){
    model.promiseGetSounds(gyaonId).then(function(result){
      const path = `./public/${gyaonId}.ltsv`
      let ltsv = `title:${gyaonId}'s Gyaon\n`

      result.forEach(function(item){
        const date = formatDate(item.lastmodified)
        const title = `${date} by ${item.user}`
        const mapimg = item.mapimg ? item.mapimg : ''
        const weather = item.weatherIcon ? item.weatherIcon : ''
        const bookmarkUrl = item.url ? item.url : ''
        let address = ''

        if(item.address){
          item.address.split(',').forEach(element => {
            if(element){
              address += '[' + element + ']'
            }
          })
        }

        const url = `https://scrapbox.io/${gyaonId}-gyaon/${title}?body=` +
          encodeURIComponent(
            `[${mapimg}]\n `+
            `[音声 https://gyaon.herokuapp.com/sounds/${item.key}]\n` +
            '[* コメント]\n' +
            ` ${item.comment}\n` +
            '[* 天気]\n' +
            ` [${weatherToEmoji(weather)}]\n` +
            '[* 位置]\n' +
            ` ${address}付近\n` +
            '[* 日時]\n' +
            ` ${date}\n` +
            '[* 見ていたURL]\n'
          ) + ` ${bookmarkUrl}`
        ltsv += ` title:${title}\turl:${url}\n`
      })

      fs.writeFile(path, ltsv, function(err){
        if(err) resolve(err);
        resolve(path)
      })
    })
  })
}
