class TunePk extends videoSupportImpl {
  constructor () {
    super(['tune.pk', 'tune.video'], {})
    const self = this

    return { api: self, id: 'tune' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexGetVideoId = /(?:\/\/|\.)tune\.(?:video|pk)\/(?:player|video|play)\/(?:[\w\.\?]+=)?(\d+)/

    const videoId = regexGetVideoId.exec(url)[1]

    request({ url: `https://embed.tune.pk/play/${videoId}`, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const parsedHtml = $(parseHtml(body))
        const url = parsedHtml.find("meta[itemprop='contentURL']").attr('content')
        const poster = parsedHtml.find("meta[itemprop='thumbnailUrl']").attr('content')
        const quality = parsedHtml.find("meta[itemprop='videoQuality']").attr('content')

        if (new RegExp(self.regexValidateUrl).test(url)) {
          returnFunction({poster: poster, url: url}, VideoDecoderErrorCodes.Sucess, true)
        } else {
          console.error('invalid url')
          returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
        }

        // TODO Read all players from api with m3u8
        // "https://tune.pk/api_public/playerConfigs/?api_key=777750fea4d3bd585bf47dc1873619fc&id=" + videoId + "&embed=true";
      } else {
        console.error(error)
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    })
  }
}
