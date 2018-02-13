class DriveGoogleCom extends videoSupportImpl {
  constructor () {
    super(['drive.google.com', 'docs.google.com'], {})
    const self = this

    return { api: self, id: 'google' }
  }

  getVideoUrl (url, returnFunction) {
    if (!this.checkUrlValid(url, returnFunction)) {
      return 0
    }
    returnFunction(url, VideoDecoderErrorCodes.Sucess, false)
  }
}
