this.Mp4UploadCom = {
    domain : "mp4upload.com",

    headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36'
    },

    register: function () {
        return VideoServiceSupport.list.push({ api: Mp4UploadCom, id: "mp4upload", domain: this.domain });
    },

    getVideoUrl: function (url, returnFunction) {
        var self = this;

        const regexDataDecoder = /return p}(?:\('(.*)\'\,)([1-9]+),([1-9]+),(?:\'(.*)\'\.split)/igm;
        const regexGetVideoAndPoster = /(?:var videoposter\=\\\'(.*)\\\'\;).*(?:src:"(.+)+")/igm;

        //check domain
        if (getDomainName(url) != this.domain) {
            returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
            return;
        }

        request({ url: url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("script");
                var validEncodedData = undefined;

                _.each(listHtml, (htmlObject, htmlIndex) => {
                    if (htmlObject.innerHTML.trim().replace(/\s/g, '').search("eval") != -1) {
                        validEncodedData = htmlObject.innerHTML;
                    }
                });

                if (validEncodedData == undefined) {
                    returnFunction("", VideoDecoderErrorCodes.OTHER_ERROR);
                }

                const encodedData = regexDataDecoder.exec(validEncodedData);
                const arg1 = encodedData[1];
                const arg2 = encodedData[2];
                const arg3 = encodedData[3];
                const arg4 = encodedData[4].split("|");

                const decodedData = self.decodeString(arg1, arg2, arg3, arg4); 

                const urlsRegex = regexGetVideoAndPoster.exec(decodedData);

                const poster = urlsRegex[1];
                let url = urlsRegex[2];


                if(new RegExp(ValidateVideoUrlRegex).test(url)) {
                    returnFunction(url, VideoDecoderErrorCodes.Sucess, true);
                } else {
                    returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
                }
            } else {
                returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
            }
        });
    },

    decodeString(p, a, c, k) {
        while (c--)
            if (k[c])
                p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
        return p
    }
}
