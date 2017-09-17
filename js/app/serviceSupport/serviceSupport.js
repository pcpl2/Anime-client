this.ServiceSupport = {
    list: [],
    currentService: null,
    currentServiceId: "",
    currentServiceName: "",

    updateServiceList: function () {
        this.clearServicesList();
        AONinja.register();
    },

    getServiceFunction: function () {
        return this.currentService.api;
    },

    setCurrentService: function (id) {
        if (this.currentServiceId == id) {
            return true;
        }

        var service = _.find(this.list, function (service) { return service.id = id; });
        if (service) {
            this.currentService = service;
            this.currentServiceId = service.id;
            this.currentServiceName = service.name;
            service.api.updateAnimeList();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentService: function () {
        this.currentService = null;
        this.currentServiceId = "";
        this.currentServiceName = "";
    },

    clearServicesList: function () {
        this.list = [];
    }
};
