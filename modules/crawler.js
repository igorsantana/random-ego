const http = require('http')
const cheerio = require('cheerio')

const CrawlerFactory = (url, isJson = false) => {

  return new Promise((resolve, reject) => {
    http.get(url, response => {
      let pageData = ''

      response.on('data', (data) => (pageData += data))

      response.on('end', () => {
        if(isJson) {
          const preFormated = pageData.slice(pageData.indexOf('(') + 1, pageData.length -1)
          resolve(JSON.parse(preFormated))
          return;
        }
        resolve(cheerio.load(pageData))
      })
    })
    .on('error', e => reject(e))
  })
}

module.exports = CrawlerFactory
