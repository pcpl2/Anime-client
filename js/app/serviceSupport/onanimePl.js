class onanimePlClass extends serviceSupportImpl {
  constructor () {
    super('https://on-anime.pl', {})
    const self = this

    request({ url: self.domain, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const parsedHtml = $(parseHtml(body))

        const title = parsedHtml.find('title')[0].innerText

        const logo = 'https://on-anime.pl/motywy/Wiosna17/logo.png'

        self.serviceData = { api: self, id: 'onanimePl', name: title.substring(0, 12), description: '', lang: 'PL', image: logo }
        sm.list.push({ api: self, id: 'onanimePl' })
        m.redraw()
      } else {
        console.error(error)
      }
    })
  }

  updateAnimeList () {
    const self = this
    let animeListJson = cacheJS.get({
      serviceID: self.serviceData.id,
      type: 'Json'
    })

    if (animeListJson == null) {
      var titleObjectList = []

      const completeCallback = () => {
        let sorted = _.sortBy(titleObjectList, 'title')

        self.animeList = sorted

        cacheJS.set({ serviceID: self.serviceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400)

        self.animeListFiltered = self.animeList
        self.setListState()
      }

      self.runRequest(1, 0, completeCallback, titleObjectList)
    } else {
      self.animeList = JSON.parse(animeListJson)
      self.animeListFiltered = self.animeList
      self.setListState()
    }
  }

  runRequest (pageId, maxPageId, completeCallback, titleObjects) {
    const self = this

    const url = `${self.domain}/moduly/anime/ajax.szukaj.php`

    const form = {
      strona: pageId,
      sortuj: 0,
      widok: 1,
      strony: maxPageId
    }

    request.post({ url: url, headers: app.defaultHeaders, form: form }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const baseHtml = $(parseHtml(body))
        const strony = baseHtml.find('script')[0]
        const listHtml = baseHtml.find('div.ramka > div.tbl > div.tab')

        if (strony !== undefined) {
          maxPageId = parseInt(strony.innerText.slice(9, -1))
        }

        _.each(listHtml, (item, indexItem) => {
          const htmlObj = $(item)
          const imageObj = htmlObj.find('div > div.obrazek')[0]
          const aObj = htmlObj.find('div > h2 > a')[0]
          const descObj = htmlObj.find('div > h6')[1]
          const obj = {
            id: aObj.getAttribute('href').split('/').pop().toLowerCase(),
            url: `${self.domain}/${aObj.getAttribute('href')}/odcinki`,
            title: aObj.innerText.trim(),
            img: `${self.domain}/${imageObj.getAttribute('onclick').slice(9, -2)}`,
            desc: descObj.innerText.trim()
          }

          titleObjects.push(obj)
        })

        if (pageId >= maxPageId) {
          completeCallback()
        } else {
          pageId++
          self.runRequest(pageId, maxPageId, completeCallback, titleObjects)
        }
      } else {
        console.error(error)
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
      }
    })
  }

  updateCurrentAnimeData () {
    const self = this

    request({ url: self.selectedAnime.url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('#lista_odcinkow > div.tab')

        var episodeList = []

        _.each(listHtml, (item, indexItem) => {
          if (indexItem !== 0) {
            const itemObj = $(item)

            const epNumber = itemObj.children()[1].innerText
            const epTitle = itemObj.find('div.tp.tbl > a').text()
            const epUrl = itemObj.find('div.tp.tbl > div.right > div > a').attr('href')

            const obj = {
              id: epUrl.split('/').pop(),
              url: `${self.domain}${epUrl}`,
              title: `${epNumber} - ${epTitle}`
            }

            episodeList.push(obj)
          }
        })

        self.episodeList = episodeList

        m.redraw()
      } else {
        console.error(error)
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
      }
    })
  }

  updateCurrentEpisodeData () {
    const self = this

    if (self.selectedEpisode != null) {
      self.selectedEpisode.players = []
    }

    request({ url: self.selectedEpisode.url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const listHtml = $(parseHtml(body)).find('div.tw')
        const regexClearType = /">(.+)<span/

        _.each(listHtml, (item, indexItem) => {
          if (indexItem !== 0) {
            const aObj = $(item).find('div > a[onclick]')
            const videoId = aObj.attr('onclick').slice(8, -2)
            const playerName = regexClearType.exec(aObj.html())[1].trim()

            self.addPlayerToList(videoId, playerName, indexItem)
          }
        })
      } else {
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
        console.error(error)
      }
    })
  }

  addPlayerToList (playerId, playerName, playerCount) {
    const self = this

    const url = `${self.domain}/moduly/anime/ajax.online.php`

    const form = {
      id: playerId
    }

    request.post({ url: url, headers: app.defaultHeaders, form: form }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const baseHtml = $(parseHtml(body))
        const iframe = baseHtml.find('iframe')
        let videoUrl = iframe.attr('src')

        if (videoUrl.substring(0, 2) === '//') {
          videoUrl = 'https:' + videoUrl
        }

        const splitedDomainPlayer = getDomainName(videoUrl).split('.')
        const playerObj = {
          id: splitedDomainPlayer[splitedDomainPlayer.length - 2].toLowerCase() + '_' + playerCount,
          url: videoUrl,
          lang: 'PL',
          name: playerName,
          desc: '-',
          referer: self.selectedEpisode.url
        }

        self.selectedEpisode.players.push(playerObj)
        m.redraw()
      } else {
        // ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
        console.error(error)
      }
    })
  }
}
