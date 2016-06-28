const url = 'http://ego.globo.com/'
const crawler = require('./modules/crawler')
const querystring = require('querystring')
const sha1 = require('sha1')

crawler(url)
  .then(data =>{
    const newsLinks = Array.prototype.slice.call(data('.chamada a').map((i, el) => el.attribs.href))
    const comments = newsLinks.map(v => {
      const editorial = v.split('/')[3]
      const slug = v.split('/').pop().split('.').shift()
      const baseUrl = 'http://comentarios.globo.com/comentarios/'
      const baseUrlSecondPart = ['jornalismo', 'ego', editorial].reduce((p, v) => p.concat('@@').concat(v), '')
      const hash = sha1(slug)
      const uriArray = [baseUrl.concat(baseUrlSecondPart), hash, v, 'shorturl', slug.concat('.html'), 'numero']
      return uriArray.reduce((p, v) => p === '' ? v : p.concat('/').concat(v.replace(/\//g, '//').replace(/\//g, '@')), '')
    })

    const allComments = comments.map(val => {
        let pagesToCrawl = crawler(val, true).then(data => {
            for(var i = 1, pages = []; i <= data.totalPaginas; i++){
              pages.push(val.replace('numero', (i + "") .concat('.json')));
            }
            return Promise.all(pages.map(v => crawler(v, true)))
          })

        return pagesToCrawl.then(data => data.reduce((p, v) => p.concat(v.itens), []));
    })

    allComments[0].then(v => {

    })

    allComments.forEach(comment => {
      comment.then(data => {
        console.log('Notícia: ' + data[0].topico.titulo);
        console.log('Comentários: ');
        console.log(data.reduce((p, n, index) => p.concat(index + ": ").concat(n.texto).concat('\n'), ''));
      })
    })
  })
