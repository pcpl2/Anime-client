
function DecodeCloudflareEmailProtect(e, t, r, n) {
    for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2)
        r += String.fromCharCode('0x' + e.substr(t, 2) ^ n);
    return r
}

function getVideoUrl(url, returnFunction) {
    const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm;
    var domain = regex.exec(url)[1].toLowerCase();
    switch (domain) {
        case "vidfile.net":
            DecodeVidFileNet(url, returnFunction)
        break;
    }
    //DecodeVidFileNet('https://vidfile.net/v/59ons7sro9265', function(url, code) {console.log(url + " code: " + code)})
}
