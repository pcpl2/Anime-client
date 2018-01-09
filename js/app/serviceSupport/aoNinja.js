this.AONinja = {
    currentServiceData: null,

    headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36'
    },

    ///Anime List
    animeList: [],
    animeListFiltered: [],
    currentAnime: null,
    ///Episode List
    episodeList: [],
    currentEpisodeId: "",
    currentEpisodeTitle: "",
    currentEpisodePlaysers: [],

    register: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/",
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let logo = $(parseHtml(res)).find(".navbar-header").find(".logo").find("img").attr('src')

            // todo: move id, name and other metadata to the service object itself (AONinja)
            AONinja.currentServiceData = { api: AONinja, id: "aoninja", name: "A-O.NINJA", description: "", lang: "PL", image: logo };
            ServiceSupport.list.push({ api: AONinja, id: "aoninja" })
        })
    },

    getImageFunction: function (returnCallback) {
        returnCallback(AONinja.currentServiceData.image);
    },

    updateAnimeList: function () {
        const self = this;
        let animeListJson = cacheJS.get({
            serviceID: AONinja.currentServiceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            const urls = ['https://a-o.ninja/anime', 'https://a-o.ninja/filmy'];
            var completeRequests = 0;
            var titleObjectList = [];

            completeCallback = () => {
                let sorted = _.sortBy(titleObjectList, 'title');

                AONinja.animeList = sorted;

                cacheJS.set({ serviceID: AONinja.currentServiceData.id, type: 'Json' }, JSON.stringify(AONinja.animeList), 86400);

                AONinja.animeListFiltered = AONinja.animeList;
                AONinja.setListState();
            }

            _.each(urls, (url, indexUrl) => {
                request({ url: url, headers: self.headers }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const listHtml = $(parseHtml(body)).find(".list-item").find("td").find("a");

                        _.each(listHtml, (item, indexItem) => {
                            let title = item.innerHTML;
                            let emailProtect = item.querySelector('.__cf_email__');

                            if (emailProtect) {
                                emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                                title = item.innerHTML;
                            }

                            let obj = {
                                id: item.getAttribute("href").split("/").pop(),
                                url: item.getAttribute("href"),
                                title: title
                            };

                            titleObjectList.push(obj);
                        });

                        completeRequests++;

                        if (completeRequests == urls.length) {
                            completeCallback();
                        }

                    } else {
                        //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
                    }

                });
            });
        } else {
            AONinja.animeList = JSON.parse(animeListJson);
            AONinja.animeListFiltered = AONinja.animeList;
            AONinja.setListState();
        }
    },

    setCurrentAnime: function (id) {
        this.clearCurrentEpisode();
        if (this.currentAnime != null && this.currentAnime.id == id) {
            return true;
        }

        var anime = _.find(this.animeList, function (anime) { return anime.id == id; });
        if (anime) {
            this.currentAnime = { id: anime.id, title: anime.title, url: anime.url, img: null, desc: null }

            this.updateCurrentAnimeData();
            return true;
        } else {
            return false;
        }
    },

    updateCurrentAnimeData() {
        const self = this;

        request({ url: self.currentAnime.url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find(".lista_odc_tytul_pozycja").find("a");

                var episodeList = [];

                _.each(listHtml, (item, indexItem) => {
                    let title = item.innerHTML;
                    let emailProtect = item.querySelector('.__cf_email__');

                    if (emailProtect) {
                        emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                        title = item.innerHTML;
                    }

                    let obj = {
                        id: item.getAttribute("href").split("/").pop(),
                        url: item.getAttribute("href"),
                        title: title
                    };

                    console.log(obj);
                    episodeList.push(obj);
                });
                self.episodeList = episodeList.reverse();

                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    },

    setCurrentEpisode: function (id) {
        var self = this;
        if (self.currentEpisodeId == id) {
            return true;
        }

        let episode = _.find(self.episodeList, function (episode) { return episode.id == id; });

        if (episode) {
            self.currentEpisodeId = episode.id;
            self.currentEpisodeTitle = episode.title;
            self.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentAnime: function () {
        this.currentAnime = null;

        this.episodeList = [];
        this.clearCurrentEpisode();
    },

    clearCurrentEpisode: function () {
        this.currentEpisodeId = "";
        this.currentEpisodeTitle = "";
        this.currentEpisodePlaysers = [];
    },

    updateCurrentEpisodeData() {
        const self = this;
        self.currentEpisodePlaysers = [];
        const url = self.currentAnime.url + "/" + self.currentEpisodeId;

        request({ url: url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("#video-player-control").find("div");

                _.each(listHtml, (item, indexItem) => {
                    let obj = {
                        id: item.innerHTML.replace(/\s/g, '').toLowerCase() + indexItem,
                        url: JSON.parse(CryptoJS.DES.decrypt(item.getAttribute('data-hash'), "s05z9Gpd=syG^7{", { format: d }).toString(CryptoJS.enc.Utf8)),
                        lang: "PL",
                        name: item.innerHTML.trim(),
                        desc: "-",
                        referer: url
                    }

                    console.log(obj)
                    self.currentEpisodePlaysers.push(obj);
                });
                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    },

    getServiceUrlObjById: function (id) {
        let player = _.find(this.currentEpisodePlaysers, function (player) { return player.id == id; });
        if (player) {
            return { url: player.url, referer: player.referer };
        } else {
            return false;
        }
    },

    searchAnime: function (text) {
        AONinja.animeListFiltered = _.filter(AONinja.animeList, function (obj) { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
        AONinja.setListState();
    },

    clearSearchAnime: function () {
        this.animeListFiltered = this.animeList;
    },

    setListState() {
        if (this.animeListFiltered.length > 0) {
            ServiceSupport.currentServiceStatus = ServiceStatus.LOADED;
        } else {
            ServiceSupport.currentServiceStatus = ServiceStatus.EMPTY;
        }
        m.redraw();
    }
};
