class Mp4UploadCom extends videoSupportImpl {
  constructor () {
    super(['mp4upload.com'], {})
    const self = this

    return { api: self, id: 'mp4upload' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexDataDecoder = /return\ p\}(?:\('(.*)\'\,)([0-9]+),([0-9]+),(?:\'(.*)\'\.split)/
    const regexGetVideoAndPoster = /(?:var videoposter\=\\\'(.*)\\\'\;).*(?:src:"(.+)+")/igm

    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('script')
        var validEncodedData

        _.each(listHtml, (htmlObject, htmlIndex) => {
          if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('eval') !== -1) {
            validEncodedData = htmlObject.innerHTML
          }
        })

        if (validEncodedData === undefined) {
          returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
        }

        const encodedData = regexDataDecoder.exec(validEncodedData)
        const arg1 = encodedData[1]
        const arg2 = encodedData[2]
        const arg3 = encodedData[3]
        const arg4 = encodedData[4].split('|')

        const decodedData = self.decodeString(arg1, arg2, arg3, arg4)

        const urlsRegex = regexGetVideoAndPoster.exec(decodedData)

        const poster = urlsRegex[1]
        const url = urlsRegex[2]

        if (new RegExp(self.regexValidateUrl).test(url)) {
          returnFunction(url, VideoDecoderErrorCodes.Sucess, true)
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

  decodeString (p, a, c, k) {
    while (c--) {
      if (k[c]) {
        p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c])
      }
    }
    return p
  }
}
