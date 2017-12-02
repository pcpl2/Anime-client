this.ServiceSupport = {
    list: [],
    currentService: null,

    updateServiceList: function () {
        this.clearServicesList();
        AONinja.register();
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
