this.dailymotionCom = {
    domain: "dailymotion.com",

    register: function () {
        return VideoServiceSupport.list.push({ api: dailymotionCom, id: "dailymotion", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        const regexValidateVideoUrl = /(?:http|ftp|https):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])/igm;
        const regexValidDailymotion = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(dailymotion)\.[a-z]{2,3}\/(?:(embed|swf|#)\/)?video\/([^/?_]+)/igm;
        const regexGetConfig = /(?:var config )= \{?({.+\}\})\;/igm;
        //check domain
        if (getDomainName(url) != this.domain) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }

        const parsedDomain = regexValidDailymotion.exec(url);
        const connectUrl = "http://www.dailymotion.com/embed/video/" + parsedDomain[3]

        request({ url: connectUrl, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("script");
                var validConfigJson = undefined;

                _.each(listHtml, (htmlObject, htmlIndex) => {
                    if (htmlObject.innerHTML.trim().replace(/\s/g, '').search("try{varconfig=") != -1) {
                        validConfigJson = regexGetConfig.exec(htmlObject.innerHTML.trim())[1];
                    }
                });

                if (validConfigJson == undefined) {
                    returnFunction("", VideoDecoderErrorCodes.OTHER_ERROR);
                }

                const parsedConfgiJson = JSON.parse(validConfigJson);

                console.log(parsedConfgiJson);

                const posters = parsedConfgiJson.metadata.posters;
                const qualities = parsedConfgiJson.metadata.qualities;

                var maxQuality = undefined;

                _.each(_.keys(qualities), (qKeyString) => {
                    if(qKeyString != "auto") {
                        if(maxQuality == undefined) {
                            maxQuality = parseInt(qKeyString);
                        } else {
                            if(maxQuality < parseInt(qKeyString)) {
                                maxQuality = parseInt(qKeyString);
                            }
                        }
                    }
                });

                const videoObject = _.find(qualities[maxQuality], (obj) => { return obj.type == "video/mp4"});

                if(new RegExp(regexValidateVideoUrl).test(videoObject.url)) {
                    returnFunction(videoObject.url, VideoDecoderErrorCodes.Sucess, true);
                } else {
                    returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
                }
            } else {
                returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
            }
        });
    }
}
