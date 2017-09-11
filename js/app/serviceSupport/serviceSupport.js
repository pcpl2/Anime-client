this.ServiceSupport = {
    list: [],
    currentService: "",
    currentServiceName: "",
    updateAONinjaData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/",
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            console.log($(res).find(".navbar-header").find(".logo").find("img").attr('src'));
            ServiceSupport.list.push({ id: "aoninja", name: "A-O.NINJA", description: "", image: $(res).find(".navbar-header").find(".logo").find("img").attr('src') })
            console.log("A-O.ninja data loaded")
        })
    },

    updateServiceList: function () {
        ServiceSupport.clearServicesList();
        ServiceSupport.updateAONinjaData();
    },

    getServiceFunction: function () {
        switch (ServiceSupport.currentService) {
            case "aoninja":
                return AONinja;
                break;
        }
    },

    setCurrentService: function (id) {
        if (ServiceSupport.currentService == id) {
            return true;
        }
        var service = _.find(ServiceSupport.list, function (service) { return service.id = id; });
        if (service) {
            ServiceSupport.currentService = service.id;
            ServiceSupport.currentServiceName = service.name;
            ServiceSupport.getServiceFunction().updateAnimeList();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentService: function () {
        ServiceSupport.currentService = "";
        ServiceSupport.currentServiceName = "";
    },

    clearServicesList: function () {
        ServiceSupport.list = [];
    }
};
