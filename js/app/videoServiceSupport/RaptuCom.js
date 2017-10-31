this.RaptuCom = {
    domain: "raptu.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: RaptuCom, id: "raptu", domain: this.domain });
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
            let videoUrl = $(parseHtml(res)).find("script").map(function () {
                if (this.innerHTML.search("sources") != -1) {
                    let plaintTextList = regexSourceDecoder.exec(this.innerHTML)[0].slice(11);
                    let listOfUrls = JSON.parse(plaintTextList);

                    if (listOfUrls.length > 1) {
                        let url720p = _.find(listOfUrls, function (video) { return video.label == "720p"; });
                        let url480p = _.find(listOfUrls, function (video) { return video.label == "480p"; });
                        if (url720p) {
                            return url720p.file;
                        } else if (url480p) {
                            return url480p.file;
                        } else {
                            return undefined;
                        }
                    } else {
                        return listOfUrls[0];
                    }
                }
            }).get()[0];

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
