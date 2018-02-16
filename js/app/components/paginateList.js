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

  getPage (pageNumber) {
    return this.elements[pageNumber - 1]
  }

  createElementsMap (elementsArray) {
    this.elements = []
    if (elementsArray.length === 0) {
      this.elements.push([])
    }
    _.each(elementsArray, (item, index) => {
      if (index % this.showElements === 0) {
        this.elements.push([item])
      } else {
        this.elements[this.elements.length - 1].push(item)
      }
    })
    this.maxPage = this.elements.length
    this.pageNumber = 1
  }

  onupdate (vnode) {
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
      m('span', { class: 'page-link' }, 'Previous')
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

    if (this.currentPage + 1 < this.maxPage) {
      buttons.push(m('li', { class: 'page-item' }, [
        m('button', { class: 'page-link', onclick: () => { this.currentPage = this.currentPage + 1 } }, this.currentPage + 1)
      ]))
      if (this.currentPage + 2 < this.maxPage) {
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
      m('.animeList', { 'class': 'col-md-12 card-group', 'style': 'margin-top: 1%;' }, [
        this.getPage(this.currentPage).map((anime) => {
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
