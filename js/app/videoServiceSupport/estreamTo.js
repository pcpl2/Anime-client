this.estreamTo = {
    domain: "estream.to",

    register: function () {
        return VideoServiceSupport.list.push({ api: estreamTo, id: "estream", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const regexSourceDecoder = /\"sources\"\: \[.+(\"\])/igm;
        const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
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
            let videoUrl = $(parseHtml(res)).find("video").map(function () {

                let videoObjects = Array.from(this.children).map( el => {
                    if(el.type == "video/mp4") {
                        var obj = { url: el.src, quality: el.attributes[3].nodeValue }
                        return obj;
                    }
                })

                videoObjects.shift();

                let VideoHQ = _.find(videoObjects, function (video) { return video.quality == "854x480"; });

                return VideoHQ.url;

            })[0];

            if (new RegExp(regexValidateUrl).test(videoUrl)) {
                returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
            } else {
                returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
            }
        }).catch(function (e) {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        })

    }
}
