this.VidLoxTv = {
    domain : "vidlox.tv",

    register: function () {
        return VideoServiceSupport.list.push({ api: VidLoxTv, id: "vidlox", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const regexSourceDecoder = /sources\: \[.+(\"\])/igm;
        const regexGetFileExtension = /\.\w{3,4}($|\?)/igm;
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
            let videoUrl = $(parseHtml(res)).find("script").map(function() {
                if(this.innerHTML.search("sources") != -1) {
                    let plaintTextList = regexSourceDecoder.exec(this.innerHTML)[0].slice(9);
                    let listOfUrls = JSON.parse(plaintTextList);
    
                    if(listOfUrls.length > 1) {
                        var url = "";
                        var found = false;
                        _.each(listOfUrls, function(video) {
                            var vidExt = regexGetFileExtension.exec(video);
                            if(vidExt == null) {
                                vidExt = regexGetFileExtension.exec(video);
                            }
                            if(vidExt[0] == ".mp4" && !found) {
                                url = video;
                                found = true;
                            }
                        });
                        return url;
                    } else {
                        return listOfUrls[0];
                    }
                }
            }).get()[0];
    
            if(new RegExp(regexValidateUrl).test(videoUrl)) {
                returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
            } else {
                returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
            }
        }).catch(function(e) {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        })
    }
}
