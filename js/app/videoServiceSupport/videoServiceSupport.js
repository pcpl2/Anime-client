var VideoDecoderErrorCodes = {
    Sucess: 50,
    INVALID_DOMAIN: 51,
    VIDEO_NOT_FOUND: 52,
    OTHER_ERROR: 53
}

const ValidateVideoUrlRegex = /(?:http|ftp|https):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])/igm;

this.VideoServiceSupport = {
    list: [],

    serviceWithHiddenLinks: [],

    updateVideoServiceList: function () {
        this.clearVideoServicesList();
        VidFileNet.register();
        VidLoxTv.register();
        RaptuCom.register();
        TunePk.register();
        Mp4UploadCom.register();
        DriveGoogleCom.register();
        vkCom.register();
        estreamTo.register();
        dailymotionCom.register();

        //Hiden video service link

        gamedorUsermdNet.register();
    },

    clearVideoServicesList: function () {
        this.list = [];
    },

    getVideoUrl: function (serviceObj, returnFunction) {
        this.getServiceUrl(serviceObj, (serviceUrl) => {
            if (serviceUrl.length > 0) {
                const domain = getDomainName(serviceUrl);
                const service = _.find(this.list, (obj) => {
                    if (obj.domains != undefined) {
                        const foundDomain = _.find(obj.domains, (stringDomain) => { return stringDomain == domain });
                        return foundDomain == domain;
                    } else {
                        return obj.domain == domain;
                    }
                });

                if (service != null) {
                    service.api.getVideoUrl(serviceUrl, returnFunction)
                } else {
                    returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
                }
            } else {
                returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
            }

        })
    },

    checkSupportPlayerById: function (id) {
        const supported = _.find(this.list, function (obj) { return id.includes(obj.id); });

        if (supported == undefined) {
            return false;
        } else {
            return true;
        }
    },

    getServiceUrl: function (serviceObj, retFunction) {
        const domain = getDomainName(serviceObj.url);
        const serviceGetter = _.find(this.serviceWithHiddenLinks, function (obj) { return obj.domain == domain });

        if (serviceGetter == undefined) {
            retFunction(serviceObj.url);
        } else {
            serviceGetter.api.getServiceLink(serviceObj, retFunction)
        }

    }
}
