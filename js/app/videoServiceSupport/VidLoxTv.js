class VidLoxTv extends videoSupportImpl {
  constructor () {
    super(['vidlox.tv'], {})
    const self = this

    return { api: self, id: 'vidlox' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const regexSourceDecoder = /sources:(.+])\,/s;
    const regexPoserDecoder = /poster: \"(.+)", /s;
    const regexGetFileExtension = /\.\w{3,4}($|\?)/igm

    m.request({
      method: 'GET',
      url: url,
      headers: {
        'Accept': 'text/html'
      },
      deserialize: (value) => { return value }
    }).then((res) => {
      const listHtml = $(parseHtml(res)).find('script')

      var data = { sources: [], labels: ["High", "HD", "SD"], poster: '' }

      _.each(listHtml, (htmlObject, htmlIndex) => {
        if (htmlObject.innerHTML.trim().replace(/\s/g, '').search('sources') !== -1) {
          const plaintSourcesList = regexSourceDecoder.exec(htmlObject.innerHTML)[1]
          const plaintPosterUrl = regexPoserDecoder.exec(htmlObject.innerHTML)[1]
          data.sources = JSON.parse(plaintSourcesList)
          data.poster = plaintPosterUrl
        }
      })

      const urls = _.zip(data.sources, data.labels)

      const videoUrl = urls[0][0]

      if (new RegExp(self.regexValidateUrl).test(videoUrl)) {
        returnFunction({poster: data.poster, url: videoUrl}, VideoDecoderErrorCodes.Sucess, true)
      } else {
        console.error('invalid url')
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    }).catch((e) => {
      console.error(e)
      returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
    })
  }
}
