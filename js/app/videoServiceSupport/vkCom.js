this.vkCom = {
    domain: "vk.com",
    domains: ["vk.com", "new.vk.com"],

    headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36'
    },

    register: function () {
        return VideoServiceSupport.list.push({ api: vkCom, id: "vk", domain: this.domain, domains: this.domains });
    },

    getVideoUrl: function (url, returnFunction) {
        const self = this;

        const checkUrl0 = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(?:vk)\.[a-z]{2,3}\/(?:video_ext\.php\?)(?:[^/?]+)/;
        const checkUrl1 = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(?:vk)\.[a-z]{2,3}\/(?:video)(?:[^/?]+)/;

        const getIdsAndHash0 = /video_ext\.php\?oid=(.*)\&id=(.*)\&hash=(.*)/;

        //check domain
        if (_.find(self.domains, (stringDomain) => { return getDomainName(url) == stringDomain }) == undefined) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }

        if (checkUrl0.test(url)) {
            const parsedDomain = getIdsAndHash0.exec(url);

            const oid = parsedDomain[1];
            const id = parsedDomain[2];
            const hash = parsedDomain[3];

            const requestUrl = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + id + "&hash=" + hash;
            self.getVideoLinks(requestUrl, returnFunction);
        } else if (checkUrl1.test(url)) {
            self.getIdsFromType1(url, (sucess, objectData) => {
                if (sucess) {
                    const oid = objectData.oid;
                    const id = objectData.id;
                    const hash = objectData.hash;

                    const requestUrl = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + id + "&hash=" + hash;
                    self.getVideoLinks(requestUrl, returnFunction);
                } else {
                    returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
                }
            });
        } else {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }
    },

    getIdsFromType1(url, ret) {
        const getIdsAndHash1 = /video\?act\=get_swf\&oid=(.*)\&vid=(.*)\&embed_hash=(.*)/;
        request({ url: url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("meta");

                const metaValid = _.find(listHtml, (metaValue) => {
                    if (metaValue.attributes.property != undefined) {
                        return metaValue.attributes.property.nodeValue == "og:video";
                    } else {
                        return false;
                    }
                })
                const fullUrl = metaValid.attributes.content.nodeValue;

                const parsedDomain = getIdsAndHash1.exec(fullUrl);
                ret(true, { oid: parsedDomain[1], id: parsedDomain[2], hash: parsedDomain[3] })
            } else {
                ret(false);
            }
        });
    },

    getVideoLinks(url, returnFunction) {
        const getQualityData = /\.([0-9]{3,4})\.mp4/;

        request({ url: url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const videoHtml = $(parseHtml(body)).find("video")[0];

                const sourceHtml = $(videoHtml).find("source");

                var poster = "";
                if (videoHtml.attributes.poster != undefined) {
                    poster = videoHtml.attributes.poster.nodeValue;
                }

                var videoObjs = [];

                _.each(sourceHtml, (sourceValue) => {
                    let vidUrl = sourceValue.src;
                    let res = getQualityData.exec(vidUrl);
                    videoObjs.push({ url: vidUrl, quality: res, qualityLabel: res + "p" })
                });

                const videoObject = videoObjs[0];

                if(new RegExp(ValidateVideoUrlRegex).test(videoObject.url)) {
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
