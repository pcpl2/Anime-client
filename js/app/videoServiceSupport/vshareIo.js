class VshareIo extends videoSupportImpl {
  constructor () {
    super(['vshare.io'], {})
    const self = this

    return { api: self, id: 'vshare' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }
    const regexUrl = /(?:\/\/|\.)(?:vshare\.io)\/(.)\/(\w+)/

    const urlDecoded = regexUrl.exec(url)
    const urlType = urlDecoded[1]
    const urlId = urlDecoded[2]

    const requestUrl = `https://vshare.io/${urlType}/${urlId}/width-1920/height-1080/`

    switch (urlType) {
      case 'v':
        self.vType(requestUrl, returnFunction)
        break
      case 'o':
        self.oType(requestUrl, returnFunction)
        break
      default:
        returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
    }
  }

  oType (url, returnFunction) {
    const self = this
    self.sendRquest(url, (body) => {
      const listHtml = $(parseHtml(body)).find('script')
      const styleWithPoster = $(parseHtml(body)).find('#player').attr('style')
      var validEncodedData

      _.each(listHtml, (htmlObject, htmlIndex) => {
        if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('flowplayer') !== -1) {
          validEncodedData = htmlObject.innerHTML
        }
      })

      if (validEncodedData === undefined) {
        returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
      }

      const regexGetVideo = /url: '(.+)',/
      const regexGetPoster = /url\(\/\/(.+)\)/

      const videoUrl = regexGetVideo.exec(validEncodedData)[1]

      const poster = regexGetPoster.exec(styleWithPoster)[1]

      if (new RegExp(self.regexValidateUrl).test(videoUrl)) {
        returnFunction({poster: poster, url: videoUrl}, VideoDecoderErrorCodes.Sucess, true)
      } else {
        console.error('invalid url')
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    }, returnFunction)
  }

  vType (url, returnFunction) {
    const self = this
    const regexGetPoster = /poster="\/\/(.+)">/

    const regexDataDecoder = /return\ p\}(?:\('(.*)\'\,)([0-9]+),([0-9]+),(?:\'(.*)\'\.split)/
    const regexData2Decoder = /=\[(.+)\]\;(?:.+)ue\)-(.+)\)\}\)\;/

    self.sendRquest(url, (body) => {
      const listHtml = $(parseHtml(body)).find('script')
      var validEncodedData
      var validOEncodedData = false

      _.each(listHtml, (htmlObject, htmlIndex) => {
        if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('eval') !== -1) {
          validEncodedData = htmlObject.innerHTML
        } else if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('flowplayer') !== -1) {
          validOEncodedData = true
        }
      })

      if (validOEncodedData) {
        self.oType(url, returnFunction)
        return
      }

      if (validEncodedData === undefined) {
        returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
        return
      }

      const poster = regexGetPoster.exec(validEncodedData)[1]

      const encodedData = regexDataDecoder.exec(validEncodedData)
      const arg1 = encodedData[1]
      const arg2 = encodedData[2]
      const arg3 = encodedData[3]
      const arg4 = encodedData[4].split('|')

      const decodedData = self.decodeString(arg1, arg2, arg3, arg4, 0, {})

      if (decodedData === undefined) {
        returnFunction('', VideoDecoderErrorCodes.OTHER_ERROR)
      }

      const encodedData2 = regexData2Decoder.exec(decodedData)

      const d2arg1 = encodedData2[1].split(',')
      const d2arg2 = encodedData2[2]

      const decodedData2 = self.decode2(d2arg1, d2arg2)

      const listVideoHtml = $(parseHtml(decodedData2)).find('source')

      const urls = []

      _.each(listVideoHtml, (source) => {
        const JqSource = $(source)
        urls.push({
          url: JqSource.attr('src'),
          label: JqSource.attr('label')
        })
      })

      if (new RegExp(self.regexValidateUrl).test(urls[0].url)) {
        returnFunction({poster: poster, url: urls[0].url}, VideoDecoderErrorCodes.Sucess, true)
      } else {
        console.error('invalid url')
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    }, returnFunction)
  }

  decodeString (p, a, c, k, e, d) {
    e = function (c) {
      return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
    }
    if (!''.replace(/^/, String)) {
      while (c--) {
        d[e(c)] = k[c] || e(c)
      }
      k = [function (e) {
        return d[e]
      }
      ]
      e = function () {
        return '\\w+'
      }
      c = 1
    };
    while (c--) {
      if (k[c]) {
        p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
      }
    }
    return p
  }

  decode2 (arr, code) {
    var str1 = ''
    _.each(arr, (value) => {
      str1 += String.fromCharCode(parseInt(value) - code)
    })

    return str1
  }

  sendRquest (url, completeBodyRet, returnFunction) {
    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        completeBodyRet(body)
      } else {
        console.error(error)
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    })
  }
}
