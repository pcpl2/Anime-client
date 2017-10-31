var VideoDecoderErrorCodes = {
    Sucess: 50,
    INVALID_DOMAIN: 51,
    VIDEO_NOT_FOUND: 52,
    OTHER_ERROR: 53
}

this.VideoServiceSupport = {
    list: [],

    updateVideoServiceList: function () {
        this.clearVideoServicesList();
        VidFileNet.register();
        VidLoxTv.register();
        RaptuCom.register();
        TunePk.register();
        Mp4UploadCom.register();
        DriveGoogleCom.register();
    },

    clearVideoServicesList: function () {
        this.list = [];
    },

    getVideoUrl: function(url, returnFunction) {
        let domain = getDomainName(url);
        let service = _.find(this.list, function(obj) { return obj.domain == domain });

        if(service != null) {
            service.api.getVideoUrl(url, returnFunction)
        }
    },

    checkSupportPlayerById: function(id) {    
        let supported = _.find(this.list, function(obj) { return id.includes(obj.id); });
    
        if(supported == undefined) {
            return false;
        } else {
            return true;
        }
    }
}
