
function DecodeCloudflareEmailProtect(e, t, r, n) {
    for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2)
        r += String.fromCharCode('0x' + e.substr(t, 2) ^ n);
    return r
}
