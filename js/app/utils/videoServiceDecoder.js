var VideoDecoderErrorCodes = {
    Sucess: 50,
    INVALID_DOMAIN: 51,
    VIDEO_NOT_FOUND: 52,
    OTHER_ERROR: 53
}

function getDomainName(url) {
    const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm;
    var domain = regex.exec(url)[1].toLowerCase();
    return domain;
}

function DecodeVidFileNet(url, returnFunction) {
    //check is vidfile.net
    if (getDomainName(url) != "vidfile.net") {
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
        let source = $(res).find('#player > source')[0];
        let videoUrl = source.getAttribute('src');
        returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess);
    }).catch(function (e) {
        returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
    })
}

function DecodeRaptuCom(url, returnFunction) {
    const regexSourceDecoder = /\"sources\"\: \[.+(\"\])/igm;
    const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
    //check is raptu.com
    if (getDomainName(url) != "raptu.com") {
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
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(res, "text/html");

        let videoUrl = $(xmlDoc).find("script").map(function() {
            if(this.innerHTML.search("sources") != -1) {
                let plaintTextList = regexSourceDecoder.exec(this.innerHTML)[0].slice(11);
                let listOfUrls = JSON.parse(plaintTextList);

                if(listOfUrls.length > 1) {
                    let url720p = _.find(listOfUrls, function (video) { return video.label == "720p"; });
                    let url480p = _.find(listOfUrls, function (video) { return video.label == "480p"; });
                    if(url720p) {
                        return url720p.file;
                    } else if(url480p) {
                        return url480p.file;
                    } else {
                        return undefined;
                    }
                } else {
                    return listOfUrls[0];
                }
            }
        }).get()[0];

        if(new RegExp(regexValidateUrl).test(videoUrl)) {
            returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess);
        } else {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }
    }).catch(function(e) {
        returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
    })
}

function DecodeVidLoxTv(url, returnFunction) {
    const regexSourceDecoder = /sources\: \[.+(\"\])/igm;
    const regexGetFileExtension = /\.\w{3,4}($|\?)/igm;
    const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
    //check is vidlox.tv
    if (getDomainName(url) != "vidlox.tv") {
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
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(res, "text/html");

        let videoUrl = $(xmlDoc).find("script").map(function() {
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
            returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess);
        } else {
            returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }
    }).catch(function(e) {
        returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
    })
}
