this.Mp4UploadCom = {
    domain : "mp4upload.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: Mp4UploadCom, id: "mp4upload", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const regexDataDecoder = /\,\'\|.+(\'\.split\(\'\|\'\))/igm;
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
    
                    let tmpData1 = regexDataDecoder.exec(this.innerHTML)[0].slice(2);
                    let tmpData2 = tmpData1.slice(0, tmpData1.length - 12)
                    let tmpData3 = tmpData2.split("|");
                    console.log(tmpData3);
    
                    let url = tmpData3[4] + "://" + tmpData3[7] + "." + tmpData3[3] + "." + tmpData3[2] + ":" + tmpData3[20] + "/d/" + tmpData3[19] + "/" + tmpData3[9] + "." + tmpData3[6];
                    console.log(url);
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
    }
}
