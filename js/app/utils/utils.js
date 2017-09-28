
function DecodeCloudflareEmailProtect(e, t, r, n) {
    for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2)
        r += String.fromCharCode('0x' + e.substr(t, 2) ^ n);
    return r
}

function getVideoUrl(url, returnFunction) {
    const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm;
    var domain = regex.exec(url)[1].toLowerCase();
    console.log(domain);
    switch (domain) {
        case "vidfile.net":
            DecodeVidFileNet(url, returnFunction);
            break;
        case "drive.google.com":
            //default google player is safe
            returnFunction(url, VideoDecoderErrorCodes.Sucess, false);
            break;
        case "raptu.com":
            DecodeRaptuCom(url, returnFunction);
            break;
        case "vidlox.tv":
            DecodeVidLoxTv(url, returnFunction);
            break;
        case "mp4upload.com":
            DecodeMp4UploadCom(url, returnFunction);
            break;
    }
}

function parseHtml(res) {
    return new DOMParser().parseFromString(res, "text/html");
}
