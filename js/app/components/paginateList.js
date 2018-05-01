class AnimePaginateList {
  constructor (vnode) {
    this.showElements = 16
    this.currentPage = 1
    this.maxPage = 0
    this.elements = []

    if (vnode.attrs.showElements !== undefined) {
      this.showElements = vnode.attrs.showElements
    }

    this.createElementsMap(vnode.attrs.elements)
  }

  getPage () {
    return this.elements[this.currentPage - 1]
  }

  createElementsMap (elementsArray) {
    this.elements = [[]]
    _.each(elementsArray, (item, index) => {
      if (index === 0) {
        this.elements.pop()
      }
      if (index % this.showElements === 0) {
        this.elements.push([item])
      } else {
        this.elements[this.elements.length - 1].push(item)
      }
    })

    this.maxPage = this.elements.length

    if (this.maxPage < this.currentPage) {
      this.currentPage = this.maxPage
    }
  }

  onbeforeupdate (vnode) {
    this.createElementsMap(vnode.attrs.elements)
  }

  onremove (vnode) {
    this.elements = []
    this.currentPage = 1
    this.maxPage = 1
  }

  currentPageEdit (number, minus) {
    if (minus) {
      this.currentPage = this.currentPage - number
    } else {
      this.currentPage = this.currentPage + number
    }
  }

  generatePagesButton () {
    const buttons = []
    const page = this.currentPage

    buttons.push(m('li', { class: ['page-item', page === 1 ? ' disabled' : ' '].join(''), onclick: () => { if (page > 1) { this.currentPageEdit(1, true) } } }, [
      m('button', { class: 'page-link' }, 'Previous')
    ]))

    if (page > 1) {
      if (page > 2) {
        buttons.push(m('li', { class: 'page-item' }, [
          m('button', { class: 'page-link', onclick: () => { this.currentPageEdit(2, true) } }, page - 2)
        ]))
      }

      buttons.push(m('li', { class: 'page-item' }, [
        m('button', { class: 'page-link', onclick: () => { this.currentPageEdit(1, true) } }, page - 1)
      ]))
    }

    buttons.push(m('li', { class: 'page-item active' }, [
      m('button', { class: 'page-link' }, page)
    ]))

    if (page + 1 <= this.maxPage) {
      buttons.push(m('li', { class: 'page-item' }, [
        m('button', { class: 'page-link', onclick: () => { this.currentPageEdit(1, false) } }, page + 1)
      ]))
      if (page + 2 <= this.maxPage) {
        buttons.push(m('li', { class: 'page-item' }, [
          m('button', { class: 'page-link', onclick: () => { this.currentPageEdit(2, false) } }, page + 2)
        ]))
      }
    }

    buttons.push(m('li', { class: ['page-item', page === this.maxPage ? ' disabled' : ' '].join(''), onclick: () => { if (page < this.maxPage) { this.currentPageEdit(1, false) } } }, [
      m('button', { class: 'page-link' }, 'Next')
    ]))

    return m('nav', [
      m('ul', { class: 'pagination justify-content-center' }, [
        buttons
      ])
    ])
  }

  view (vnode) {
    return m('div', [
      this.generatePagesButton(),
      m('.animeList', { 'class': 'col-md-12 card-group', 'style': 'margin-top: 1%;' }, [
        this.getPage().map((anime) => {
          return m('div', { 'class': 'col-md-3' }, [
            PageCard.animeCard(anime.id,
              anime.title,
              sm.getApi().serviceData.id)
          ])
        })
      ]),
      this.generatePagesButton()
    ])
  }
}

class EpisodePaginateList {
  constructor (vnode) {
    this.showElements = 16
    this.currentPage = 1
    this.maxPage = 0
    this.elements = []

    if (vnode.attrs.showElements !== undefined) {
      this.showElements = vnode.attrs.showElements
    }

    this.createElementsMap(vnode.attrs.elements)
  }

  getPage () {
    return this.elements[this.currentPage - 1]
  }

  createElementsMap (elementsArray) {
    this.elements = [[]]
    _.each(elementsArray, (item, index) => {
      if (index === 0) {
        this.elements.pop()
      }
      if (index % this.showElements === 0) {
        this.elements.push([item])
      } else {
        this.elements[this.elements.length - 1].push(item)
      }
    })
    this.maxPage = this.elements.length
    if (this.maxPage < this.currentPage) {
      this.currentPage = this.maxPage
    }
  }

  onbeforeupdate (vnode) {
    this.createElementsMap(vnode.attrs.elements)
  }

  onremove (vnode) {
    this.elements = []
    this.currentPage = 1
    this.maxPage = 1
  }

  generatePagesButton () {
    const buttons = []

    buttons.push(m('li', { class: ['page-item', this.currentPage === 1 ? ' disabled' : ' '].join(''), onclick: () => { if (this.currentPage > 1) { this.currentPage-- } } }, [
      m('button', { class: 'page-link' }, 'Previous')
    ]))

    if (this.currentPage > 1) {
      if (this.currentPage > 2) {
        buttons.push(m('li', { class: 'page-item' }, [
          m('button', { class: 'page-link', onclick: () => { this.currentPage = this.currentPage - 2 } }, this.currentPage - 2)
        ]))
      }

      buttons.push(m('li', { class: 'page-item' }, [
        m('button', { class: 'page-link', onclick: () => { this.currentPage = this.currentPage - 1 } }, this.currentPage - 1)
      ]))
    }

    buttons.push(m('li', { class: 'page-item active' }, [
      m('button', { class: 'page-link' }, this.currentPage)
    ]))

    if (this.currentPage + 1 <= this.maxPage) {
      buttons.push(m('li', { class: 'page-item' }, [
        m('button', { class: 'page-link', onclick: () => { this.currentPage = this.currentPage + 1 } }, this.currentPage + 1)
      ]))
      if (this.currentPage + 2 <= this.maxPage) {
        buttons.push(m('li', { class: 'page-item' }, [
          m('button', { class: 'page-link', onclick: () => { this.currentPage = this.currentPage + 2 } }, this.currentPage + 2)
        ]))
      }
    }

    buttons.push(m('li', { class: ['page-item', this.currentPage === this.maxPage ? ' disabled' : ' '].join(''), onclick: () => { if (this.currentPage < this.maxPage) { this.currentPage++ } } }, [
      m('button', { class: 'page-link' }, 'Next')
    ]))

    return m('nav', [
      m('ul', { class: 'pagination justify-content-center' }, [
        buttons
      ])
    ])
  }

  view (vnode) {
    return m('div', [
      this.generatePagesButton(),
      m('.episodeList', { 'class': 'col-md-12 card-group', 'style': 'margin-top: 1%;' }, [
        this.getPage().map((episode) => {
          return m('div', { 'class': 'col-md-3' }, [
            PageCard.episodeCard(episode.id,
              episode.title,
              sm.getApi().selectedAnime.id,
              sm.getApi().serviceData.id)
          ])
        })
      ]),
      this.generatePagesButton()
    ])
  }
}
