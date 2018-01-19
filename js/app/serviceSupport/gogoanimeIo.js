this.GogoanimeIo = {
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
    currentEpisodeUrl: "",
    currentEpisodePlaysers: [],

    register: function () {
        var self = this;

        request({ url: "https://ww4.gogoanime.io", headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const parsedHtml = $(parseHtml(body));

                const metaList = parsedHtml.find("meta");

                const metaTitle = _.find(metaList, (metaValue) => {
                    if (metaValue.attributes.property != undefined) {
                        return metaValue.attributes.property.nodeValue == "og:site_name";
                    } else {
                        return false;
                    }
                });

                const metaDescription = _.find(metaList, (metaValue) => {
                    if (metaValue.attributes.property != undefined) {
                        return metaValue.attributes.property.nodeValue == "og:description";
                    } else {
                        return false;
                    }
                });

                const logo = parsedHtml.find("img.logo")[0].src;

                self.currentServiceData = { api: self, id: "gogoanimeIo", name: metaTitle.attributes.content.nodeValue, description: metaDescription.attributes.content.nodeValue, lang: "EN", image: logo };
                ServiceSupport.list.push({ api: self, id: "gogoanimeIo" });
                m.redraw();
            } else {
                console.error(error);
            }
        });
    },

    getImageFunction: function (returnCallback) {
        var self = this;

        returnCallback(self.currentServiceData.image);
    },

    updateAnimeList: function () {
        const self = this;
        let animeListJson = cacheJS.get({
            serviceID: self.currentServiceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            const startUrl = "https://ww4.gogoanime.io/anime-list.html?page="

            var titleObjectList = [];

            completeCallback = () => {
                let sorted = _.sortBy(titleObjectList, 'title');

                self.animeList = sorted;

                cacheJS.set({ serviceID: self.currentServiceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400);

                self.animeListFiltered = self.animeList;
                self.setListState();
            }

            self.runRequest(startUrl, 1, completeCallback, titleObjectList);

        } else {
            self.animeList = JSON.parse(animeListJson);
            self.animeListFiltered = self.animeList;
            self.setListState();
        }
    },

    runRequest(url, pageId, completeCallback, titleObjects) {
        const self = this;

        const urlForRequest = url + pageId;

        request({ url: urlForRequest, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const baseHtmlList = $(parseHtml(body)).find("ul.listing");
                const listHtml = baseHtmlList.find("li");

                _.each(listHtml, (item, indexItem) => {
                    const htmlObj2 = $(parseHtml(item.title));
                    const htmlObj = item.children[0];
                    let obj = {
                        id: htmlObj.getAttribute("href").split("/").pop(),
                        url: htmlObj.getAttribute("href"),
                        title: htmlObj2.find("a.bigChar")[0].innerText,
                        img: htmlObj2.find("div.thumnail_tool").find("img")[0].src,
                        desc: htmlObj2.find("p.sumer")[0].innerText.slice(13).trim(),
                    };

                    titleObjects.push(obj);
                });

                if (baseHtmlList[0].children.length < 136) {
                    completeCallback();
                } else {
                    pageId++;
                    self.runRequest(url, pageId, completeCallback, titleObjects)
                }
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    },

    clearCurrentAnime: function () {
        this.currentAnime = null;

        this.episodeList = [];
        this.clearCurrentEpisode();
    },

    clearCurrentEpisode: function () {
        this.currentEpisodeId = "";
        this.currentEpisodeTitle = "";
        this.currentEpisodeUrl = "";
        this.currentEpisodePlaysers = [];
    },

    setCurrentAnime: function (id) {
        this.clearCurrentEpisode();
        if (this.currentAnime != null && this.currentAnime.id == id) {
            return true;
        }

        const encodedAnimeId = encodeURI(id).toLowerCase();

        var anime = _.find(this.animeList, function (anime) { return anime.id == encodedAnimeId; });
        if (anime) {
            this.currentAnime = { id: anime.id, title: anime.title, url: anime.url, img: anime.img, desc: anime.desc }

            this.updateCurrentAnimeData();
            return true;
        } else {
            return false;
        }
    },

    getCurrentAnimeTitle: function() {
        if(GogoanimeIo.currentAnime) {
            return GogoanimeIo.currentAnime.title;
        } else {
            return "";
        }
    },

    updateCurrentAnimeData() {
        const self = this;

        request({ url: "https://ww4.gogoanime.io/" + self.currentAnime.url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const parsedBody = $(parseHtml(body));
                const moveId = parsedBody.find("input#movie_id").val();
                const lastEpNumber = parsedBody.find(".anime_video_body > #episode_page > li:last-child > a").attr("ep_end");

                const urlForApi = "https://ww4.gogoanime.io/load-list-episode?ep_start=0&ep_end=" + lastEpNumber + "&id=" + moveId + "&default_ep=0";

                request({ url: urlForApi + self.currentAnime.url, headers: self.headers }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const parsedBodyApi = $(parseHtml(body)).find("#episode_related");

                        var episodeList = [];

                        _.each(parsedBodyApi.children(), (item, indexItem) => {
                            let obj = {
                                id: item.children[0].href.split("/").pop(),
                                url: "/" + item.children[0].href.split("/").pop(),
                                title: item.children[0].children[0].innerText.trim()
                            };

                            episodeList.push(obj);
                        });
                        self.episodeList = episodeList.reverse();

                        m.redraw();
                    } else {
                        console.error(error);
                        //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
                    }
                });

            } else {
                console.error(error);
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
            self.currentEpisodeUrl = episode.url;
            self.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    },

    updateCurrentEpisodeData() {
        const self = this;
        self.currentEpisodePlaysers = [];
        const url = "https://ww4.gogoanime.io/" + self.currentEpisodeUrl;

        request({ url: url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find(".anime_muti_link > ul").children();
                const regexClearType = /(.+)<span>/;

                _.each(listHtml, (item, indexItem) => {
                    if (item.className != "anime") {
                        const videoObjectUrl = _.find(item.children[0].attributes, (attr) => { return attr.name == "data-video" });

                        var videoUrl = "";

                        if (videoObjectUrl != undefined) {
                            if (videoObjectUrl.nodeValue.substring(0, 2) == "//") {
                                videoUrl = "http:" + videoObjectUrl.nodeValue;
                            } else {
                                videoUrl = videoObjectUrl.nodeValue;
                            }

                            const name = regexClearType.exec(item.children[0].innerHTML)[1];

                            const obj = {
                                id: name.replace(/\s/g, '').toLowerCase()  + "_" + indexItem,
                                url: videoUrl,
                                lang: "EN",
                                name: name,
                                desc: "-",
                                referer: url
                            }

                            self.currentEpisodePlaysers.push(obj);
                        }
                    }
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
        GogoanimeIo.animeListFiltered = _.filter(GogoanimeIo.animeList, (obj) => { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
        GogoanimeIo.setListState();
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
}
