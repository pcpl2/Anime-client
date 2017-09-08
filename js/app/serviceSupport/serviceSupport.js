this.ServiceSupport = {
    list: [],
    currentService: "",
    currentServiceName: "",
    updateAONinjaData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/",
            deserialize: function (value) { return value },
        }).then(function (res) {
            console.log($(res).find(".navbar-header").find(".logo").find("img").attr('src'));
            ServiceSupport.list.push({ id: "aoninja", name: "A-O.NINJA", description: "", image: $(res).find(".navbar-header").find(".logo").find("img").attr('src') })
            console.log("A-O.ninja data loaded")
        })
    },

    updateServiceList: function() {
        ServiceSupport.clearServicesList();
        ServiceSupport.updateAONinjaData();
    },

    getServiceFunction: function() {
        switch(ServiceSupport.currentService) {
            case "aoninja":
                console.log("AO ninja");
                return AONinja;
                break;
        }
    },

    setCurrentService: function(id) {
        var service = _.find(ServiceSupport.list, function(service){ return service.id = id; });
        if(service) {
            ServiceSupport.currentService = service.id;
            ServiceSupport.currentServiceName = service.name;
            return true;
        } else {
            return false;
        }
    },

    clearCurrentService: function() {
        ServiceSupport.currentService = "";
        ServiceSupport.currentServiceName = "";
    },

    clearServicesList: function() {
        ServiceSupport.list = [];
    }

    /*updateAnimeListServiceData: function(sid) {
        switch(sid) {
            case "aoninja":
                console.log("AO ninja");
                AONinja.updateAnimeList(sid);
                break;
        }
    },

    getAnimeList: function(sid) {
        switch(sid) {
            case "aoninja":
                console.log("AO ninja");
                return AONinja.animeList;
                break;
        }
    }*/
};