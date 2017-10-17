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
        let source = $(parseHtml(res)).find('#player > source')[0];
        let videoUrl = source.getAttribute('src');
        returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
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
        let videoUrl = $(parseHtml(res)).find("script").map(function() {
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
            returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess, true);
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

function DecodeMp4UploadCom(url, returnFunction) {
    const regexDataDecoder = /\,\'\|.+(\'\.split\(\'\|\'\))/igm;
    const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
    //check is mp4upload.com
    if (getDomainName(url) != "mp4upload.com") {
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

function DecodeTunePk(url, returnFunction) {
    const regexGetVideoId = /embed_player\.php\?vid=(\d.+)/igm;
    const regexValidateUrl = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/igm
    //check is tune.pk
    if (getDomainName(url) != "tune.pk") {
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
