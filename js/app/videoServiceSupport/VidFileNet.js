class VidFileNet extends videoSupportImpl {
  constructor () {
    super(['vidfile.net'], {})
    const self = this

    return { api: self, id: 'vidfile' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    m.request({
      method: 'GET',
      url: url,
      headers: {
        'Accept': 'text/html'
      },
      deserialize: (value) => { return value }
    }).then((res) => {
      const videoUrl = $(parseHtml(res)).find('#player > source').attr('src')

      if (new RegExp(self.regexValidateUrl).test(videoUrl)) {
        returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true)
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
