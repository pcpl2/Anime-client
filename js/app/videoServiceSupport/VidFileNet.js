this.VidFileNet = {
    domain : "vidfile.net",

    register: function () {
        return VideoServiceSupport.list.push({ api: VidFileNet, id: "vidfile", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        //check domain
        if (getDomainName(url) != this.domain) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }

        m.request({
            method: "GET",
            url: url,
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let source = $(parseHtml(res)).find('#player > source')[0];
            let videoUrl = source.getAttribute('src');
            returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
        }).catch(function (e) {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        })

    }
}
