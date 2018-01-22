class serviceSupportImpl {
    constructor(domain, serviceData) {
        this.serviceData = serviceData;

        this.serviceStatus = ServiceStatus.LOADING;

        this.domain = domain;

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
        const animeIdEncoded = encodeURI(animeId).toLowerCase();

        const anime = _.find(this.animeList, (anime) => {
            return anime.id == animeIdEncoded;
        });
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

        const episode = _.find(this.episodeList, (episode) => {
            return episode.id == episodeId;
        });

        if (episode) {
            this.selectedEpisode = { id: episode.id, title: episode.title, url: episode.url, players: [] }
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
        const player = _.find(this.selectedEpisode.players, (player) => {
            return player.id == urlId;
        });
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
        self.animeListFiltered = _.filter(self.animeList, (obj) => {
            return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase());
        });
        self.setListState();
    }

    clearSearchAnime() {
        this.animeListFiltered = this.animeList;
    }

    //TODO change or remove 
    setListState() {
        if (this.animeListFiltered.length > 0) {
            this.serviceStatus = ServiceStatus.LOADED;
        } else {
            this.serviceStatus = ServiceStatus.EMPTY;
        }
        m.redraw();
    }
}
