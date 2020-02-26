var selectServiceBreadcrumb = {
  view: () =>  {
    return [m('span', { 'class': 'breadcrumb-item active' }, 'SelectService')]
  }
}

var selectServiceHeader = {
  view: () =>  {
    return m('label', { 'class': 'col-form-label col-md-2' }, 'Select service')
  }
}

var selectServiceList = {
  view: () =>  {
    return m('.serviceList', { class: 'row col-md-12' },
      sm.list.map((service) => {
        return m('div', { class: 'col-sm-5' }, m(PageCard.serviceCard, { service: service }))
      }))
  }
}

this.SelectService = {
  oninit: (vnode) => {
    sm.clearCurrentService()
    sm.updateServiceList()
  },

  view: () => {
    return layout(m(selectServiceBreadcrumb), m(selectServiceHeader), m(selectServiceList))
  }
}
