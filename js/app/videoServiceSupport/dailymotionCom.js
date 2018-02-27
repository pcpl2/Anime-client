class DailymotionCom extends videoSupportImpl {
  constructor () {
    super(['dailymotion.com'], {})
    const self = this

    return { api: self, id: 'dailymotion' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexValidDailymotion = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(dailymotion)\.[a-z]{2,3}\/(?:(embed|swf|#)\/)?video\/([^/?_]+)/igm
    const regexGetConfig = /(?:var config )= \{?({.+\}\})\;/igm

    const parsedDomain = regexValidDailymotion.exec(url)
    const connectUrl = 'http://www.dailymotion.com/embed/video/' + parsedDomain[3]

    request({ url: connectUrl, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('script')
        var validConfigJson

        _.each(listHtml, (htmlObject, htmlIndex) => {
          if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('try{varconfig=') !== -1) {
            validConfigJson = regexGetConfig.exec(htmlObject.innerHTML.trim())[1]
          }
        })

        if (validConfigJson === undefined) {
          returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
        }

        const parsedConfgiJson = JSON.parse(validConfigJson)

        const posters = parsedConfgiJson.metadata.posters
        const poster = parsedConfgiJson.metadata.poster_url
        const qualities = parsedConfgiJson.metadata.qualities

        var maxQuality

        _.each(_.keys(qualities), (qKeyString) => {
          if (maxQuality === undefined) {
            maxQuality = parseInt(qKeyString)
          } else {
            if (maxQuality < parseInt(qKeyString)) {
              maxQuality = parseInt(qKeyString)
            }
          }
        })

        if (new RegExp(self.regexValidateUrl).test(qualities[maxQuality][0].url)) {
          returnFunction({poster: poster, url: qualities[maxQuality][0].url}, VideoDecoderErrorCodes.Sucess, true)
        } else {
          console.error('invalid url')
          returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
        }
      } else {
        console.error(error)
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    })
  }
}
