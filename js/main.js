const electron = require('electron')
const path = require('path')
const url = require('url')

const {app, BrowserWindow} = electron

let mainWindow

const isDevelopment = process.env.NODE_ENV !== 'production'

function createMainWindow () {
  const window = new BrowserWindow({
    width: 1200,
    height: 700,
    useContentSize: true,
    frame: true,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  window.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file',
    slashes: true
  }))

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

app.on('ready', () => {
  mainWindow = createMainWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})
