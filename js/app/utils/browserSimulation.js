function getDataAndCookieNew (url, returnCallback) {
  nw.Window.open(url, {show: false}, function (win) {
    // Release the 'win' object here after the new window is closed.
    win.on('closed', function () {
      win = null
    })

    // Release the 'win' object here after the new window is closed.
    win.on('loaded', function () {
      console.log('debug')
      chrome.cookies.getAll({'url': 'http://' + win.window.document.domain}, (cookieArray) => {
        returnCallback(win.window.document, cookieArray)
        win.close(true)
      })
    })

    // Listen to main window's close event
    nw.Window.get().on('close', function () {
      // Hide the window to give user the feeling of closing immediately
      this.hide()

      // If the new window is still open then close it.
      if (win != null) { win.close(true) }

      // After closing the new window, close the main window.
      this.close(true)
    })
  })
}
