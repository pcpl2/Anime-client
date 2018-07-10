class VidozaNet extends videoSupportImpl {
  constructor () {
    super(['vidoza.net'], {})
    const self = this

    return { api: self, id: 'vidoza' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexGetVideoAndPoster = /poster:\"(.+)\",play(?:.+)updateSrc\((.+)\)\;/gm;

    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('script')
        var validEncodedData

        _.each(listHtml, (htmlObject, htmlIndex) => {
          if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('videojs') !== -1) {
            validEncodedData = htmlObject.innerHTML.trim().replace(/\s/g, '')
          }
        })

        if (validEncodedData === undefined) {
          returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
        }

        const encodedData = regexGetVideoAndPoster.exec(validEncodedData)
        const url = encodedData[2]
        const poster = encodedData[1]

        if (new RegExp(self.regexValidateUrl).test(url)) {
          returnFunction({poster: poster, url: url}, VideoDecoderErrorCodes.Sucess, true)
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
