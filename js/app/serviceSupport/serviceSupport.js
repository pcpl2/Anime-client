var ServiceStatus = {
  LOADED: 10,
  LOADING: 11,
  EMPTY: 12,
  ERROR: 13
}

class ServiceManager {
  constructor () {
    this.list = []
    this.currentService = null
  }

  updateServiceList () {
    this.clearServicesList()

    new aoninjaClass()
    new animezoneClass()
    new gogoanimeioClass()
    new onanimePlClass()
  }

  getApi () {
    return this.currentService.api
  }

  setCurrentService (serviceId) {
    if (this.currentService != null && this.currentService.id === serviceId) {
      return true
    }

    var service = _.find(this.list, (service) => {
      return service.id === serviceId
    })
    if (service) {
      this.currentService = service
      this.currentServiceStatus = ServiceStatus.LOADING
      service.api.updateAnimeList()
      return true
    } else {
      return false
    }
  }

  clearCurrentService () {
    this.currentService = null
  }

  clearServicesList () {
    this.list = []
  }
}
