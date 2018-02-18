const $ = require('jquery')
const _ = require('underscore')
const m = require('mithril')
const request = require('request')

const AutoUpdater = require('nw-autoupdater')
const updater = new AutoUpdater(require('./package.json'), {})

class App {
  constructor () {
    this.defaultHeaders = {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36',
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

async function update () {
  try {
    if (updater.isSwapRequest()) {
      $('#application').hide()
      $('#updater').show()
      output.innerHTML += `\nSwapping...`
      await updater.swap()
      output.innerHTML += `\nDone...`
      await updater.restart()
      return
    }

    const rManifest = await updater.readRemoteManifest()
    const needsUpdate = await updater.checkNewVersion(rManifest)

    if (!needsUpdate) {
      return
    }
    if (!confirm('New release is available. Do you want to upgrade?')) {
      return
    }

    const progressDownload = $('.progress-bar-update-download')
    progressDownload.text('0%')
    const progressInstall = $('.progress-bar-update-install')
    progressInstall.text('0%')

    updater.on('download', (downloadSize, totalSize) => {
      let precent = Math.floor(downloadSize / totalSize * 100)
      progressDownload.css('width', precent + '%').attr('aria-valuenow', precent)
      progressDownload.text(precent + '%')
      console.log('download progress', precent, '%')
    })

    updater.on('install', (installFiles, totalFiles) => {
      let precent = Math.floor(installFiles / totalFiles * 100)
      progressInstall.css('width', precent + '%').attr('aria-valuenow', precent)
      progressInstall.text(precent + '%')
      console.log('install progress', precent, '%')
    })

    let downloadBox = $('#download-update')
    let installBox = $('#install-update')

    downloadBox.css('display', 'block')
    const updateFile = await updater.download(rManifest)
    downloadBox.css('display', 'none')
    installBox.css('display', 'block')
    await updater.unpack(updateFile)
    installBox.css('display', 'none')
    alert(`The application will automatically restart to finish installing the update`)
    await updater.restartToSwap()
  } catch (e) {
    alert('An error occurred while downloading / installing the update. The update has been canceled, another attempt will be made the next time the application is launched')
    console.error(e)
  }
}

update()
