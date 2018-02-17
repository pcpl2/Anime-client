const VideoDecoderErrorCodes = {
  Sucess: 50,
  INVALID_DOMAIN: 51,
  VIDEO_NOT_FOUND: 52,
  OTHER_ERROR: 53
}

class VideoManager {
  constructor () {
    this.list = []
    this.serviceWithHiddenLinks = []

    this.updateVideoServiceList()
  }

  updateVideoServiceList () {
    this.clearVideoServicesList()

    // this.list.push(new VidFileNet())
    this.list.push(new VidLoxTv())
    this.list.push(new TunePk())
    this.list.push(new DriveGoogleCom())
    this.list.push(new Estream())
    this.list.push(new Mp4UploadCom())
    this.list.push(new DailymotionCom())
    this.list.push(new RaptuCom())
    this.list.push(new VkCom())

    this.serviceWithHiddenLinks.push(new GamedorUsermdNet())
  }

  clearVideoServicesList () {
    this.list = []
    this.serviceWithHiddenLinks = []
  }

  getServiceUrl (serviceObj, retFunction) {
    const domain = getDomainName(serviceObj.url)
    const serviceGetter = _.find(this.serviceWithHiddenLinks, (obj) => {
      const foundDomain = _.find(obj.api.getDomains(), (stringDomain) => { return stringDomain === domain })
      return foundDomain === domain
    })

    if (serviceGetter === undefined) {
      retFunction(serviceObj.url)
    } else {
      serviceGetter.api.getServiceLink(serviceObj, retFunction)
    }
  }

  getVideoUrl (serviceObj, returnFunction) {
    this.getServiceUrl(serviceObj, (serviceUrl) => {
      if (serviceUrl.length > 0) {
        const domain = getDomainName(serviceUrl)
        const service = _.find(this.list, (obj) => {
          const foundDomain = _.find(obj.api.getDomains(), (stringDomain) => { return stringDomain === domain })
          return foundDomain === domain
        })

        if (service != null) {
          service.api.getVideoUrl(serviceUrl, returnFunction)
        } else {
          returnFunction('', VideoDecoderErrorCodes.INVALID_DOMAIN)
        }
      } else {
        returnFunction('', VideoDecoderErrorCodes.VIDEO_NOT_FOUND)
      }
    })
  }

  checkSupportPlayerById (id) {
    const regexClearFromId = /(.*)_[0-9]+/
    const idNoNumbers = regexClearFromId.exec(id)[1].toLowerCase()
    var supported = _.find(this.list, function (obj) { if (obj.id.includes(idNoNumbers)) { return true } else if (idNoNumbers.includes(obj.id)) { return true } else { return false } })

    if (supported === undefined) {
      supported = _.find(this.serviceWithHiddenLinks, function (obj) { if (obj.id.includes(idNoNumbers)) { return true } else if (idNoNumbers.includes(obj.id)) { return true } else { return false } })
      if (supported === undefined) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }
}
