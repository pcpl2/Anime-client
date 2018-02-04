this.DriveGoogleCom = {
    domain : "drive.google.com",
    domains: ["drive.google.com", "docs.google.com"],

    register: function () {
        return VideoServiceSupport.list.push({ api: DriveGoogleCom, id: "google", domain: this.domain, domains: this.domains });
    },

    getVideoUrl: function (url, returnFunction) {
        //check domain
        if (_.find(self.domains, (stringDomain) => { return getDomainName(url) == stringDomain }) == undefined) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }
        
        returnFunction(url, VideoDecoderErrorCodes.Sucess, false);
    }
}
