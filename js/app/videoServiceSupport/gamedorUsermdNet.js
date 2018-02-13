class GamedorUsermdNet extends hideVideoServiceSupportImpl {
  constructor () {
    super(['gamedor.usermd.net'], {})
    const self = this

    return { api: self, id: 'usermd' }
  }

  getServiceLink (dataObj, returnFunction) {
    const self = this
    if (!self.checkUrlValid(dataObj.url, returnFunction)) {
      return 0
    }

    const headers = {
      'Accept': app.defaultHeaders.Accept,
      'Referer': dataObj.referer,
      'User-Agent': app.defaultHeaders['User-Agent']
    }

    request({ url: dataObj.url, headers: headers }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('iframe')
        returnFunction(listHtml[0].src)
      } else {
        console.error(error)
        returnFunction('')
      }
    })
  }
}
