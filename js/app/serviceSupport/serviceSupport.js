var ServiceStatus = {
    LOADED: 10,
    LOADING: 11,
    EMPTY: 12,
    ERROR: 13
}

this.ServiceSupport = {
    list: [],
    currentService: null,
    currentServiceStatus: ServiceStatus.EMPTY,

    updateServiceList: function () {
        this.clearServicesList();
        AONinja.register();
        AnimeZone.register();
    },

    getServiceFunction: function () {
        return this.currentService.api;
    },

    setCurrentService: function (id) {
        if (this.currentService != null && this.currentService.id == id) {
            return true;
        }

        var service = _.find(this.list, function (service) { return service.id == id; });
        if (service) {
            this.currentService = service;
            this.currentServiceStatus = ServiceStatus.LOADING;
            service.api.updateAnimeList();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentService: function () {
        this.currentService = null;
    },

    clearServicesList: function () {
        this.list = [];
    }
};
