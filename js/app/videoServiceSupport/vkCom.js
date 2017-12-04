this.vkCom = {
    domain : "vk.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: vkCom, id: "vk", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const get240p = /\"url240\"\:\"(.+)\"\,\"url360/igm;
        const get360p = /\"url360\"\:\"(.+)\"\,\"url480/igm;
        const get480p = /\"url480\"\:\"(.+)\"\,\"url720/igm;
        const get720p = /\"url720\"\:\"(.+)\"\,\"cache240/igm;

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
                if(this.innerHTML.search("ajax.preload") != -1) {

                    let url240p = get240p.exec(this.innerHTML)[1].replace(/\\/g , "");
                    let url360p = get360p.exec(this.innerHTML)[1].replace(/\\/g , "");
                    let url480p = get480p.exec(this.innerHTML)[1].replace(/\\/g , "");
                    let url720p = get720p.exec(this.innerHTML)[1].replace(/\\/g , "");

                    console.log(url240p);
                    console.log(url360p);
                    console.log(url480p);
                    console.log(url720p);

                    return url720p;
                }
            }).get()[0];
            
            returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
        }).catch(function (e) {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        })

    }
}
