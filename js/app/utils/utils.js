//usage a(e, 0) e = d083b1a3b1bdb9fda3b1be9097b1beb2b1a2b1beb1b9
function DecodeCloudflareEmailProtect(e, t, r, n) {
    for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2)
        r += String.fromCharCode('0x' + e.substr(t, 2) ^ n);
    return r
}
