this.Mp4UploadCom = {
    domain : "mp4upload.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: Mp4UploadCom, id: "mp4upload", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        var self = this;
        const regexDataDecoder1 = /return p}(.+)\)/igm;
        const regexDataDecoder2 = /\'(.+)\'\,/igm;
        const regexDataDecoder3 = /src:"(.+)+"/igm;
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
                if(this.innerHTML.search("eval") != -1) {

                    let tmp = regexDataDecoder1.exec(this.innerHTML)[1].slice(1);
                    let tmp1 = tmp.slice(0, tmp.length - 12);

                    let arg1 = regexDataDecoder2.exec(tmp1)[1];
                    
                    let tmp2 = tmp1.slice(arg1.length + 3).split(",");

                    let arg2 = tmp2[0];
                    let arg3 = tmp2[1];
                    let arg4 = tmp2[2].slice(1, tmp2[2].length - 1).split("|");

                    let decodedString = self.decodeString(arg1, arg2, arg3, arg4); 

                    let url = regexDataDecoder3.exec(decodedString)[1];

                    return url;
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
    },

    decodeString(p, a, c, k) {
        while (c--)
            if (k[c])
                p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
        return p
    }
}
