this.TunePk = {
    domain : "tune.pk",

    register: function () {
        return VideoServiceSupport.list.push({ api: TunePk, id: "tune", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const regexGetVideoId = /embed_player\.php\?vid=(\d.+)/igm;
        const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
        //check domain
        if (getDomainName(url) != this.domain) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }
    
        var videoId = regexGetVideoId.exec(url)[1];
        
            let apiUrl = "https://tune.pk/api_public/playerConfigs/?api_key=777750fea4d3bd585bf47dc1873619fc&id=" + videoId + "&embed=true";
        
            m.request({
                method: "GET",
                url: apiUrl,
                headers: {
                    "Accept": "text/html"
                },
                deserialize: function (value) { return value },
            }).then(function (res) {
                let data = JSON.parse(res);
        
                if(data.code != 200) {
                    returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
                    return;
                }
        
                let videoUrl = data.data.details.player.sources[0].file
        
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
