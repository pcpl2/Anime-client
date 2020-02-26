var episodeListBreadcrumb = {
  view: () => {
    return [
      m('a', { 'class': 'breadcrumb-item', href: '/', oncreate: m.route.link }, 'SelectService'),
      m('a', { 'class': 'breadcrumb-item', href: '/service/' + sm.getApi().serviceData.id + '/list', oncreate: m.route.link }, m('span', sm.getApi().serviceData.name)),
      m('span', { 'class': 'breadcrumb-item active' }, m('span', sm.getApi().selectedAnime.title))
    ]
  }
}

var episodeListHeader = {
  view: () => {
    return m('label', { 'class': 'col-form-label col-md-12' }, sm.getApi().selectedAnime.title + ' -> select episode')
  }
}

var episodeListBody = {
  view: () => {
    return m('div',
      // TODO add anime image and description
      m(EpisodePaginateList, { elements: sm.getApi().episodeList })
    )
  }
}

this.EpisodeList = {
  oninit: (vnode) => {
    if (!vnode.attrs.sid) {
      m.route.set('/')
    }

    if (!vnode.attrs.aid) {
      m.route.set('/')
    }

    if (!sm.setCurrentService(vnode.attrs.sid)) {
      m.route.set('/')
    }

    if (!sm.getApi().setCurrentAnime(vnode.attrs.aid)) {
      m.route.set('/service/' + sm.getApi().serviceData.id + '/list')
    }

    sm.getApi().clearCurrentEpisode()
  },
  view: () => {
    return layout(m(episodeListBreadcrumb), m(episodeListHeader), m(episodeListBody))
  },
  onbeforeremove: (vnode) => {
  }
}
