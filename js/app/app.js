const $ = require('jquery')
const _ = require('underscore')
const m = require('mithril')
const request = require('request')

class App {
  constructor () {
    this.defaultHeaders = {
      'Accept': 'text/html',
      'User-Agent': navigator.userAgent,
      'Cache-Control': 'no-cache'
    }
  }
}

const app = new App()

const sm = new ServiceManager()

const vm = new VideoManager()
vm.updateVideoServiceList()

m.route(document.getElementById('application'), '', {
  '/service/:sid/list': AnimeList,
  '/service/:sid/anime/:aid/list': EpisodeList,
  '/service/:sid/anime/:aid/episode/:eid': EpisodePlay,
  '': SelectService
})

const output = document.querySelector('#output')
