this.AONinja = {
    currentServiceData: null,
    
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
            currentServiceData = { api: AONinja, id: "aoninja", name: "A-O.NINJA", description: "", image: logo };
            ServiceSupport.list.push({ api: AONinja, id: "aoninja", name: "A-O.NINJA", description: "", image: logo })
            console.log("A-O.ninja data loaded")
        })
    },

    getImageFunction: function(returnCallback) {
        returnCallback(currentServiceData.image);
    },

    updateAnimeList: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/anime",
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let animeListHtml = $(parseHtml(res)).find(".list-item").find("td").find("a");

            AONinja.animeList = animeListHtml.map(function () {
                let title = this.innerHTML;
                let emailProtect = this.querySelector('.__cf_email__');

                if (emailProtect) {
                    emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                    title = this.innerHTML;
                }

                let obj = {
                    id: this.getAttribute("href").split("/").pop(),
                    url: this.getAttribute("href"),
                    title: title
                };

                return obj;
            }).get();

            AONinja.animeListFiltered = AONinja.animeList;

            console.log("A-O.ninja anime list data loaded")
        })
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

    clearCurrentAnime: function () {
        this.currentAnime = null;

        this.episodeList = [];
        this.currentEpisodeId = "";
    },

    updateCurrentAnimeData: function () {
        return m.request({
            method: "GET",
            url: AONinja.currentAnime.url,
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let episodeListHtml = $(parseHtml(res)).find(".lista_odc_tytul_pozycja").find("a");

            AONinja.episodeList = episodeListHtml.map(function () {
                let title = this.innerHTML;
                let emailProtect = this.querySelector('.__cf_email__');

                if (emailProtect) {
                    emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                    title = this.innerHTML;
                }

                let obj = {
                    id: this.getAttribute("href").split("/").pop(),
                    url: this.getAttribute("href"),
                    title: title
                };

                console.log(obj)
                return obj;
            }).get();

            AONinja.episodeList = AONinja.episodeList.reverse();

            console.log("A-O.ninja episode list data loaded")
        })
    },

    setCurrentEpisode: function (id) {
        if (AONinja.currentEpisodeId == id) {
            return true;
        }

        let episode = _.find(AONinja.episodeList, function (episode) { return episode.id == id; });

        if (episode) {
            AONinja.currentEpisodeId = episode.id;
            AONinja.currentEpisodeTitle = episode.title;
            AONinja.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentEpisode: function () {
        AONinja.currentEpisodeId = "";
        AONinja.currentEpisodeTitle = "";
        AONinja.currentEpisodePlaysers = [];
    },

    updateCurrentEpisodeData: function () {
        return m.request({
            method: "GET",
            url: AONinja.currentAnime.url + "/" + AONinja.currentEpisodeId,
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let playersListHtml = $(parseHtml(res)).find("#video-player-control").find("div");

            var i = 0;
            AONinja.currentEpisodePlaysers = playersListHtml.map(function () {
                let obj = {
                    id: this.innerHTML.replace(/\s/g, '').toLowerCase() + i,
                    url: JSON.parse(CryptoJS.DES.decrypt(this.getAttribute('data-hash'), "s05z9Gpd=syG^7{", { format: d }).toString(CryptoJS.enc.Utf8)),
                    name: this.innerHTML.trim(),
                }

                console.log(obj)
                i++;

                return obj;
            }).get();
        })
    },

    getPlayerUrlById: function (id) {
        let player = _.find(this.currentEpisodePlaysers, function (player) { return player.id == id; });
        if (player) {
            return player.url;
        } else {
            return false;
        }
    },

    searchAnime: function (text) {
        AONinja.animeListFiltered = _.filter(AONinja.animeList, function (obj) { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
    },

    clearSearchAnime: function () {
        AONinja.animeListFiltered = AONinja.animeList;
    }
};
