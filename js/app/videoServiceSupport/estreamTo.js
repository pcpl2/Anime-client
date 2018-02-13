class Estream extends videoSupportImpl {
  constructor() {
    super(['estream.to'], {})
    const self = this

    return { api: self, id: 'estream' }
  }

  getVideoUrl(url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const parsedHtml = $(parseHtml(body))

        const poster = parsedHtml.find('div.flowplayer').attr("style").slice(22, -3)
        const videoObjChildren = parsedHtml.find("video");

        var srcList = []
        _.each(videoObjChildren.children(), (item, index) => {
          if(item.getAttribute('type') == "video/mp4") {
            srcList.push({ url: item.getAttribute('src'), quality: item.getAttribute('label') })
          }
        })

        if (new RegExp(self.regexValidateUrl).test(srcList[0].url)) {
          returnFunction(srcList[0].url, VideoDecoderErrorCodes.Sucess, true);
        } else {
          console.error("invalid url")
          returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }

      } else {
        console.error(error)
      }
    })
  }
}
