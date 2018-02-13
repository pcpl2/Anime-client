class videoSupportImpl {
  constructor (domains) {
    this.domains = domains
    this.regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
  }

  getVideoUrl (url, returnFunction) {
    console.error('Override this!')
  }

  getDomains () {
    return this.domains
  }

  checkUrlValid (url, returnFunction) {
    const self = this
    if (_.find(self.domains, (stringDomain) => { return getDomainName(url) === stringDomain }) === undefined) {
      returnFunction('', VideoDecoderErrorCodes.INVALID_DOMAIN)
      return false
    } else {
      return true
    }
  }
}

class hideVideoServiceSupportImpl {
  constructor (domains) {
    this.domains = domains
    this.regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
  }

  getServiceLink (dataObj, returnFunction) {
    console.error('Override this!')
  }

  getDomains () {
    return this.domains
  }

  checkUrlValid (url, returnFunction) {
    const self = this
    if (_.find(self.domains, (stringDomain) => { return getDomainName(url) === stringDomain }) === undefined) {
      returnFunction('', VideoDecoderErrorCodes.INVALID_DOMAIN)
      return false
    } else {
      return true
    }
  }
}
