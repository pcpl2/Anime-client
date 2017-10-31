this.DriveGoogleCom = {
    domain : "drive.google.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: DriveGoogleCom, id: "google", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        //check domain
        if (getDomainName(url) != this.domain) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }
        
        returnFunction(url, VideoDecoderErrorCodes.Sucess, false);
    }
}
