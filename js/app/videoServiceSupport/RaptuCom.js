class RaptuCom extends videoSupportImpl {
  constructor () {
    super(['www.raptu.com', 'raptu.com', 'rapidvideo.com'], {})
    const self = this

    return { api: self, id: 'raptu' }
  }

  getVideoUrl (url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const videoObj = $(parseHtml(body)).find('video')
        const poster = videoObj.attr('poster')

        var videoObjs = []

        _.each(videoObj.children(), (item, index) => {
          if (item.getAttribute('type') === 'video/mp4' && item.getAttribute('src') !== 'h') {
            videoObjs.push({ url: item.getAttribute('src'), qualityLabel: item.getAttribute('data-res') })
          }
        })
        const vidObj = videoObjs.pop()

        if (new RegExp(self.regexValidateUrl).test(vidObj.url)) {
          returnFunction(vidObj.url, VideoDecoderErrorCodes.Sucess, true)
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
