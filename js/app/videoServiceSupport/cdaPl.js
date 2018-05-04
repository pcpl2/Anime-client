class CdaPL extends videoSupportImpl {
  constructor () {
    super(['cda.pl'], {})
    const self = this

    return { api: self, id: 'cda' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexValidCda = /(?:https?:\/\/)?(?:(?:www)\.)?(?:cda)\.[a-z]{2,3}\/video\/([^/?_]+)/igm

    const parsedDomain = regexValidCda.exec(url)
    const videoId = parsedDomain[1]
    const connectUrl = `https://ebd.cda.pl/900x525/${videoId}`

    request({ url: connectUrl, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const parsedHtml = $(parseHtml(body))

        const playerdataJson = parsedHtml.find(`#mediaplayer${videoId}`).attr('player_data')
        const parsedConfgiJson = JSON.parse(playerdataJson)

        const poster = parsedConfgiJson.video.thumb.slice(0, -3)
        const video = parsedConfgiJson.video.file

        if (new RegExp(self.regexValidateUrl).test(video)) {
          returnFunction({poster: poster, url: video}, VideoDecoderErrorCodes.Sucess, true)
        } else {
          console.error('invalid url')
          returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
        }
      } else {
        console.error(error)
      }
    })
  }
}
