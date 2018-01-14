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
        //AONinja.register();
        //AnimeZone.register();
        //GogoanimeIo.register();

        const AONinja = new aoninjaClass();
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


class serviceSupportImpl {
    constructor(domain, serviceData, headers) {
        this.serviceData = serviceData;

        this.domain = domain;
        this.headers = headers;

        this.animeList = [];
        this.animeListFiltered = [];
        this.selectedAnime = null;

        this.episodeList = [];
        this.episodListFiltered = [];
        this.selectedEpisode = null;
    }

    getImageFunction(returnCallback) {
        returnCallback(this.serviceData.image);
    }

    updateAnimeList() {
        console.error("Override this!");
    }

    setCurrentAnime(animeId) {
        this.clearCurrentEpisode();
        if (this.selectedAnime != null && this.selectedAnime.id == animeId) {
            return true;
        }

        const anime = _.find(this.animeList, function (anime) { return anime.id == animeId; });
        if (anime) {
            this.selectedAnime = { id: anime.id, title: anime.title, url: anime.url, img: anime.img, desc: anime.desc }

            this.updateCurrentAnimeData();
            return true;
        } else {
            return false;
        }
    }

    updateCurrentAnimeData() {
        console.error("Override this!");
    }

    setCurrentEpisode(episodeId) {
        var self = this;
        if (this.selectedEpisode != null && this.selectedEpisode.id == episodeId) {
            return true;
        }

        const episode = _.find(this.episodeList, function (episode) { return episode.id == episodeId; });

        if (episode) {
            this.selectedEpisode = { id: episode.id, title: episode.title, url: episode.url }
            this.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    }

    getCurrentEpisodeIndex() {
        const self = this;

        if (self.selectedEpisode == null) {
            console.error("episode is not setted.")
        }

        return _.indexOf(self.episodeList, _.find(self.episodeList, (ep) => {
            return ep.id == self.selectedEpisode.id;
        }));
    }

    updateCurrentEpisodeData() {
        console.error("Override this!");
    }

    getServiceUrlObjById(urlId) {
        const player = _.find(this.selectedEpisode.players, function (player) { return player.id == urlId; });
        if (player) {
            return { url: player.url, referer: player.referer };
        } else {
            return false;
        }
    }

    clearCurrentAnime() {
        this.selectedAnime = null;

        this.episodeList = [];
        this.episodListFiltered = [];
        this.clearCurrentEpisode();
    }

    clearCurrentEpisode() {
        this.selectedEpisode = null;
    }

    searchAnime(text) {
        const self = this;
        self.animeListFiltered = _.filter(self.animeList, function (obj) { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
        self.setListState();
    }

    clearSearchAnime() {
        this.animeListFiltered = this.animeList;
    }

    //TODO change or remove 
    setListState() {
        if (this.animeListFiltered.length > 0) {
            ServiceSupport.currentServiceStatus = ServiceStatus.LOADED;
        } else {
            ServiceSupport.currentServiceStatus = ServiceStatus.EMPTY;
        }
        m.redraw();
    }
}
