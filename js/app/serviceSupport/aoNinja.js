this.AONinja = {
    ///Anime List
    animeList: [],
    currentAnimeId: "",
    currentAnimeTitle: "",
    currentAnimeExistImg: false,
    currentAnimeImage: "",
    currentAnimeExistDes: false,
    currentAnimeDescryption: "",
    ///Episode List
    episodeList: [],
    currentEpisodeId: "",
    currentEpisodeTitle: "",
    currentEpisodePlaysers: [],
    nextEpisodeEnable: false,
    previousEpisodeEnable: false,
    currentEpisodeCustomPlayer: false,

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
            ServiceSupport.list.push({ api: AONinja, id: "aoninja", name: "A-O.NINJA", description: "", image: logo })
            console.log("A-O.ninja data loaded")
        })
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

                console.log(obj);

                return obj;
            }).get();

            console.log("A-O.ninja anime list data loaded")
        })
    },

    setCurrentAnime: function (id) {
        AONinja.clearCurrentEpisode();
        if (AONinja.currentService == id) {
            return true;
        }
        var anime = _.find(AONinja.animeList, function (anime) { return anime.id == id; });
        if (anime) {
            AONinja.currentAnimeId = anime.id;
            AONinja.currentAnimeTitle = anime.title;
            AONinja.updateCurrentAnimeData();
            return true;
        } else {
            return false;
        }
    },

    clearCurrentAnime: function () {
        AONinja.currentAnimeId = "";
        AONinja.currentAnimeTitle = "";
        AONinja.currentAnimeImage = "";
        AONinja.currentAniemDescryption = "";
        AONinja.episodeList = [];
        AONinja.currentEpisodeId = "";
    },

    updateCurrentAnimeData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/anime/" + AONinja.currentAnimeId,
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
            AONinja.nextPreviousButtonsStatus(episode);
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

    nextPreviousButtonsStatus: function (episode) {
        let index = AONinja.episodeList.indexOf(episode);

        if (index > 0) {
            AONinja.previousEpisodeEnable = true;
        } else {
            AONinja.previousEpisodeEnable = false;
        }

        if (index < (AONinja.episodeList.length - 1)) {
            AONinja.nextEpisodeEnable = true;
        } else {
            AONinja.nextEpisodeEnable = false;
        }
    },

    updateCurrentEpisodeData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/anime/" + AONinja.currentAnimeId + "/" + AONinja.currentEpisodeId,
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

            console.log("A-O.ninja anime list data loaded")
        })
    },

    getPlayerUrlById: function (id) {
        let player = _.find(AONinja.currentEpisodePlaysers, function (player) { return player.id == id; });
        if (player) {
            return player.url;
        } else {
            return false;
        }
    }
};
