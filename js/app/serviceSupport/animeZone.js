class animezoneClass extends serviceSupportImpl {
  constructor () {
    super('http://www.animezone.pl', {})
    const self = this

    request({ url: self.domain, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        // const logo = $(parseHtml(body)).find(".navbar-header > .logo > img").attr('src')
        self.serviceData = { api: self, id: 'animezone', name: 'AnimeZone.pl', description: '', lang: 'PL', image: null }
        sm.list.push({ api: self, id: 'animezone' })

        m.redraw()
      } else {
        console.error(error)
      }
    })
  }

  getImageFunction (returnCallback) {
    let sprite = new Image()
    sprite.src = 'http://www.animezone.pl/resources/images/sprites.png'
    sprite.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 63
      canvas.getContext('2d').drawImage(sprite, 0, 180, 300, 63, 0, 0, 300, 63)

      const logo = canvas.toDataURL()
      returnCallback(logo)
    }
    sprite.crossOrigin = 'anonymous'
  }

  updateAnimeList () {
    const self = this

    const animeListJson = cacheJS.get({
      serviceID: self.serviceData.id,
      type: 'Json'
    })

    if (animeListJson == null) {
      request({ url: `${self.domain}/anime/lista`, headers: app.defaultHeaders }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const parsedHtml = $(parseHtml(body))

          var urls = []

          _.each(parsedHtml.find('.anime-list > div > a'), (urlObject) => {
            const fullUrl = self.domain + urlObject.getAttribute('href')
            if (fullUrl !== `${self.domain}/anime/lista`) {
              urls.push(fullUrl)
            }
          })

          const titleObjectList = self.processHtml(parsedHtml, urls)

          self.animeList = self.animeList.concat(titleObjectList)

          request({ url: `${self.domain}/anime/filmy`, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
              const parsedHtml = $(parseHtml(body))

              _.each(parsedHtml.find('.anime-list > div > a'), (urlObject) => {
                const fullUrl = self.domain + urlObject.getAttribute('href')
                if (fullUrl !== `${self.domain}/anime/filmy`) {
                  urls.push(fullUrl)
                }
              })

              const titleObjectList = self.processHtml(parsedHtml, urls)

              self.animeList = self.animeList.concat(titleObjectList)

              self.runRequest(urls)
            } else {
              // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
          })
        } else {
          // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
        }
      })
    } else {
      self.animeList = JSON.parse(animeListJson)
      self.animeListFiltered = self.animeList
      self.setListState()
    }
  }

  runRequest (urls) {
    const self = this
    console.log(urls[0] + ' start')
    request({ url: urls[0], headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const parsedHtml = $(parseHtml(body))

        const titleObjectList = self.processHtml(parsedHtml, urls)

        self.animeList = self.animeList.concat(titleObjectList)

        console.log(urls[0] + ' ok')
        if (urls.length > 1) {
          urls.splice(0, 1)

          // simple anty ddos aniezone
          setTimeout(() => {
            self.runRequest(urls)
          }, 500)
        } else {
          self.completeRequest()
        }
      } else {
        console.error(error)
        console.log('retry ' + urls[0])
        self.runRequest(urls)
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
      }
    })
  }

  processHtml (parsedHtml, urls) {
    const self = this
    const pagination = parsedHtml.find('.pagination')

    if (pagination.length > 0 && !(urls[0].includes('?page='))) {
      const pagesLi = pagination.find('li')
      const pagesNumber = parseInt(pagesLi[(pagesLi.length - 2)].innerText)
      for (var i = 1; i <= pagesNumber; i++) {
        if (i !== 1) {
          urls.push(urls[0] + '?page=' + i)
        }
      }
    }

    var titleObjectList = []

    _.each(parsedHtml.find('.categories-newest > .categories > .description'), (item, indexItem) => {
      const title = item.childNodes[1].childNodes[1].innerText
      const shortUrl = item.childNodes[1].childNodes[1].getAttribute('href')
      const fullUrl = self.domain + shortUrl

      const obj = {
        id: shortUrl.split('/').pop().toLowerCase(),
        url: fullUrl,
        title: title
      }

      titleObjectList.push(obj)
    })
    return titleObjectList
  }

  completeRequest () {
    var self = this

    self.animeList = _.sortBy(self.animeList, (obj) => { return obj.title })

    cacheJS.set({ serviceID: self.serviceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400)

    self.animeListFiltered = self.animeList
    self.setListState()
  }

  updateCurrentAnimeData () {
    const self = this
    self.updateCurrentAnimeDataAsync()
  }

  async updateCurrentAnimeDataAsync () {
    const self = this
    request({ url: self.selectedAnime.url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('.episodes > tbody > tr')

        var episodeList = []

        _.each(listHtml, (item, indexItem) => {
          const htmlObj = $(item)
          const title = htmlObj.find('td:nth-of-type(1)')[0].innerText + ' - ' + htmlObj.find('td:nth-of-type(2)')[0].innerText
          const aTag = htmlObj.find('td:nth-of-type(5) > a')[0]
          if (aTag !== undefined) {
            const tmpUrl = aTag.getAttribute('href')
            const url = '/' + tmpUrl.split('/').splice(1, 3).join('/')

            var obj = {
              id: url.split('/').pop(),
              url: url,
              title: title,
              players: []
            }

            console.log(obj)
            episodeList.push(obj)
          }
        })
        self.episodeList = episodeList.reverse()

        m.redraw()
      } else {
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
      }
    })
  }

  updateCurrentEpisodeData () {
    const self = this

    const episode = _.find(self.episodeList, (episode) => { return episode.id === self.selectedEpisode.id })
    const episodeUrl = self.domain + episode.url

    getDataAndCookieNew(episodeUrl, (content, cookies) => {
      const cookieObj = _.find(cookies, (obj) => { return obj.name === '_SESS' })
      const cookie = cookieObj.value

      const listHtml = $(parseHtml(content.body.innerHTML)).find('table.episode').find('tbody').children()

      _.each(listHtml, (item, indexItem) => {
        let dataForUrlPost = {
          url: episodeUrl,
          cookie: cookie,
          data: item.children[3].children[0].attributes[1].nodeValue
        }

        var lang = item.children[2].children[0].getAttribute('class').split(' ')[1]
        if (lang.toLowerCase() === 'jp') {
          lang = 'ja'
        }

        var playerAllInfo = {
          id: '',
          playercount: indexItem,
          url: dataForUrlPost,
          lang: lang,
          name: item.children[0].innerText.trim(),
          desc: item.children[1].innerHTML.trim(),
          referer: episodeUrl
        }

        self.addPlayerToListNew(playerAllInfo)
      })
    })
  }

  addPlayerToListNew (playerAllInfo) {
    const self = this

    const cookie = require('cookie')
    const content = 'data=' + playerAllInfo.url.data
    const headers = {
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
      'Referer': playerAllInfo.url.url,
      'Cookie': cookie.serialize('_SESS', playerAllInfo.url.cookie),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(content),
      'User-Agent': app.defaultHeaders['User-Agent']
    }

    request.post({ url: playerAllInfo.url.url, headers: headers, form: content }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const obj = $(parseHtml(body))
        const a = obj.find('html > body > a')
        const iframe = obj.find('html > body > iframe')
        var playerObj = {
          id: playerAllInfo.id,
          url: '',
          lang: playerAllInfo.lang,
          name: playerAllInfo.name,
          desc: playerAllInfo.desc,
          referer: playerAllInfo.referer
        }
        var url = ''

        if (a.length > 0) {
          url = a[0].href.replace('chrome-extension:', 'http:')
          playerObj.url = url
        } else if (iframe.length > 0) {
          url = iframe[0].src.replace('chrome-extension:', 'http:')
          playerObj.url = url
        }

        const splitedDomainPlayer = getDomainName(playerObj.url).split('.')
        playerObj.id = splitedDomainPlayer[splitedDomainPlayer.length - 2].toLowerCase() + '_' + playerAllInfo.playercount

        self.selectedEpisode.players.push(playerObj)
        console.log(playerObj)
        m.redraw()
      } else {
        console.error(error)
      }
    })
  }
}
