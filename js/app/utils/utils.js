
function DecodeCloudflareEmailProtect (e) {
  let r, n
  let t = 0
  for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2) { r += String.fromCharCode('0x' + e.substr(t, 2) ^ n) }
  return r
}

function getDomainName (url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm
  var domain = regex.exec(url)[1].toLowerCase()
  return domain
}

function parseHtml (res) {
  return new DOMParser().parseFromString(res, 'text/html')
}
