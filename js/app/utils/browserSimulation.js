const phantom = require('phantom')

async function getDataAndCookie (url, returnCallback) {
  const instance = await phantom.create([], {
    logLevel: 'debug'
  })

  const page = await instance.createPage()
  const status = await page.open(url)
  const pageContent = await page.property('content')
  const pageCookies = await page.cookies()

  returnCallback(pageContent, pageCookies)

  await instance.exit()
}
