var VideoDecoderErrorCodes = {
    Sucess: 50,
    INVALID_DOMAIN: 51,
    VIDEO_NOT_FOUND: 52,
    OTHER_ERROR: 53
}

function DecodeVidFileNet(url, returnFunction) {
    //check is vidfile.net
    let domainUrl = url.substr(0, 22)

    if(domainUrl != "https://vidfile.net/v/") {
        returnFunction("", VideoDecoderErrorCodes.INVALID_DOMAIN);
        return;
    }

    m.request({
        method: "GET",
        url: url,
        headers: {
            "Accept": "text/html"
        },
        async: false,
        deserialize: function (value) { return value },
    }).then(function (res) {
        let source = $(res).find('#player > source')[0];
        let videoUrl = source.getAttribute('src');
        returnFunction(videoUrl, VideoDecoderErrorCodes.Sucess);
    }).catch(function(e) {
        returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
    })
}