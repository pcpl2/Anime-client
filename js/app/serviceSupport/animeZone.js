const phantom = require('phantom');
const cookie = require('cookie');

this.AnimeZone = {
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
        var self = this;

        request({ url: "http://www.animezone.pl", headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                self.currentServiceData = { api: self, id: "animezone", name: "AnimeZone.pl", description: "", lang: "PL", image: "http://www.animezone.pl/resources/images/sprites.png" };
                ServiceSupport.list.push({ api: self, id: "animezone" });
                m.redraw();
            } else {
                console.error(error);
            }
        });
    },

    getImageFunction: function (returnCallback) {
        let sprite = new Image();
        sprite.src = 'http://www.animezone.pl/resources/images/sprites.png';
        sprite.onload = function () {
            let canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 63;
            canvas.getContext('2d').drawImage(sprite, 0, 180, 300, 63, 0, 0, 300, 63);

            let logo = canvas.toDataURL();
            returnCallback(logo);
        };
        sprite.crossOrigin = "anonymous";

    },

    updateAnimeList: function () {
        var self = this;
        let animeListJson = cacheJS.get({
            serviceID: self.currentServiceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            request({ url: "http://www.animezone.pl/anime/lista", headers: self.headers }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const parsedHtml = $(parseHtml(body));

                    var urls = [];

                    _.each(parsedHtml.find(".anime-list").find("div").find("a"), (urlObject) => {
                        const fullUrl = "http://www.animezone.pl" + urlObject.getAttribute("href");
                        if (fullUrl != "http://www.animezone.pl/anime/lista") {
                            urls.push(fullUrl);
                        }
                    });

                    const titleObjectList = self.processHtml(parsedHtml, urls);

                    self.animeList = self.animeList.concat(titleObjectList);

                    request({ url: "http://www.animezone.pl/anime/filmy", headers: self.headers }, (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            const parsedHtml = $(parseHtml(body));

                            _.each(parsedHtml.find(".anime-list").find("div").find("a"), (urlObject) => {
                                const fullUrl = "http://www.animezone.pl" + urlObject.getAttribute("href");
                                if (fullUrl != "http://www.animezone.pl/anime/filmy") {
                                    urls.push(fullUrl);
                                }
                            });

                            const titleObjectList = self.processHtml(parsedHtml, urls);

                            self.animeList = self.animeList.concat(titleObjectList);

                            self.runRequest(urls);
                        } else {
                            //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
                        }
                    });
                } else {
                    //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
                }
            });
        } else {
            self.animeList = JSON.parse(animeListJson);
            self.animeListFiltered = self.animeList;
            self.setListState();
        }
    },

    runRequest(urls) {
        var self = this;
        console.log(urls[0] + " start");
        request({ url: urls[0], headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const parsedHtml = $(parseHtml(body));

                const titleObjectList = self.processHtml(parsedHtml, urls);

                self.animeList = self.animeList.concat(titleObjectList);

                console.log(urls[0] + " ok");
                if (urls.length > 1) {
                    urls.splice(0, 1);

                    //simple anty ddos aniezone
                    setTimeout(() => {
                        self.runRequest(urls);
                    }, 500);
                } else {
                    self.completeRequest();
                }

            } else {
                console.error(error);
                console.log("retry " + urls[0])
                self.runRequest(urls);
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }

        });
    },

    processHtml(parsedHtml, urls) {
        const pagination = parsedHtml.find(".pagination");

        if (pagination.length > 0 && !(urls[0].includes("?page="))) {
            let pagesLi = pagination.find("li");
            let pagesNumber = parseInt(pagesLi[(pagesLi.length - 2)].innerText);
            for (var i = 1; i <= pagesNumber; i++) {
                if (i != 1) {
                    urls.push(urls[0] + "?page=" + i);
                }
            }
        }

        var titleObjectList = [];

        _.each(parsedHtml.find(".categories-newest").find(".categories").find(".description"), (item, indexItem) => {
            const title = item.childNodes[1].childNodes[1].innerHTML;
            const shortUrl = item.childNodes[1].childNodes[1].getAttribute("href");
            const fullUrl = "http://www.animezone.pl" + shortUrl;

            const obj = {
                id: shortUrl.split("/").pop(),
                url: fullUrl,
                title: title
            };

            titleObjectList.push(obj);
        });
        return titleObjectList;
    },

    completeRequest() {
        var self = this;

        self.animeList = _.sortBy(self.animeList, (obj) => { return obj.title; });

        cacheJS.set({ serviceID: self.currentServiceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400);

        self.animeListFiltered = self.animeList;
        self.setListState();
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

    async updateCurrentAnimeData() {
        var self = this;
        request({ url: self.currentAnime.url, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find(".episodes").find("tbody").find("tr");

                var episodeList = [];

                _.each(listHtml, (item, indexItem) => {
                    const title = item.children[0].innerText + " - " + item.children[1].innerText;
                    const tmpUrl = item.children[4].children[0].getAttribute("href");
                    const url = "/" + tmpUrl.split("/").splice(1, 3).join("/");

                    const obj = {
                        id: url.split("/").pop(),
                        url: url,
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
        const self = this;
        if (self.currentEpisodeId == id) {
            return true;
        }

        const episode = _.find(self.episodeList, (episode) => { return episode.id == id; });

        if (episode) {
            self.currentEpisodeId = episode.id;
            self.currentEpisodeTitle = episode.title;
            self.currentEpisodePlaysers = [];
            self.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    },
/*
    updateCurrentEpisodeDataNew() {
        var self = this;
        const episode = _.find(self.episodeList, function (episode) { return episode.id == self.currentEpisodeId; });
        const episodeUrl = "http://www.animezone.pl" + episode.url;
        const regexCookieDecoder = /_SESS=([^;]+)/;

        request({ url: episodeUrl, headers: self.headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log(response.headers['set-cookie']);

                var cookieObj = _.find(response.headers['set-cookie'], (obj) => { return obj.includes("_SESS"); });
                var cookie = regexCookieDecoder.exec(cookieObj)[1];

                let listHtml = $(parseHtml(body)).find("table.episode").find("tbody").children();

                _.each(listHtml, (item, indexItem) => {
                    const dataForUrlPost = {
                        url: episodeUrl,
                        cookie: cookie,
                        data: item.children[3].children[0].attributes[1].nodeValue
                    }

                    const playerAllInfo = {
                        id: item.children[0].innerHTML.replace(/\s/g, '').toLowerCase() + indexItem,
                        url: dataForUrlPost,
                        lang: item.children[2].children[0].getAttribute('class').split(" ")[1],
                        name: item.children[0].innerText.trim(),
                        desc: item.children[1].innerHTML.trim()
                    };

                    self.addPlayerToList(playerAllInfo);
                });

            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });

    },*/

    async updateCurrentEpisodeData() {
        var self = this;
        var episode = _.find(self.episodeList, (episode) => { return episode.id == self.currentEpisodeId; });
        var episodeUrl = "http://www.animezone.pl" + episode.url;

        const instance = await phantom.create();

        const page = await instance.createPage();
        const status = await page.open(episodeUrl);
        const pageContent = await page.property('content');
        const pageCookies = await page.cookies();

        const cookieObj = _.find(pageCookies, (obj) => { return obj.name == "_SESS"; });
        const cookie = cookieObj.value;

        let playersListHtml = $(parseHtml(pageContent)).find("table.episode").find("tbody").children();

        var i = 0;

        playersListHtml.map(function () {

            let dataForUrlPost = {
                url: episodeUrl,
                cookie: cookie,
                data: this.children[3].children[0].attributes[1].nodeValue
            }

            var lang = this.children[2].children[0].getAttribute('class').split(" ")[1];
            if(lang.toLowerCase() == "jp") {
                lang = "ja";
            }

            var playerAllInfo = {
                id: this.children[0].innerText.replace(/\s/g, '').toLowerCase() + i,
                url: dataForUrlPost,
                lang: lang,
                name: this.children[0].innerText.trim(),
                desc: this.children[1].innerHTML.trim(),
                referer: episodeUrl
            };

            self.addPlayerToListNew(playerAllInfo);

            i++;
        });
    },

    addPlayerToListNew(playerAllInfo) {
        const self = this;
        const content = "data=" + playerAllInfo.url.data
        const headers = {
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Referer': playerAllInfo.url.url,
            'Cookie': cookie.serialize('_SESS', playerAllInfo.url.cookie),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content),
            'User-Agent': self.headers['User-Agent']
        }

        request.post({ url: playerAllInfo.url.url, headers: headers, form: content }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const obj = $(parseHtml(body));
                const a = obj.find("html > body > a");
                const iframe = obj.find("html > body > iframe");
                var playerObj = {
                    id: playerAllInfo.id,
                    url: "",
                    lang: playerAllInfo.lang,
                    name: playerAllInfo.name,
                    desc: playerAllInfo.desc,
                    referer: playerAllInfo.referer
                }
                var url = "";

                if (a.length > 0) {
                    url = a[0].href.replace("chrome-extension:", "http:");
                    playerObj.url = url;

                } else if (iframe.length > 0) {
                    url = iframe[0].src.replace("chrome-extension:", "http:");
                    playerObj.url = url;
                }

                self.currentEpisodePlaysers.push(playerObj);
                console.log(playerObj);
                m.redraw();

            } else {
                console.error(error);
            }
        });
    },

    getServiceUrlObjById: function (id) {
        const player = _.find(this.currentEpisodePlaysers, (player) => { return player.id == id; });
        if (player) {
            return { url: player.url, referer: player.referer };
        } else {
            return false;
        }
    },

    searchAnime: function (text) {
        AnimeZone.animeListFiltered = _.filter(AnimeZone.animeList, (obj) => { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
        AnimeZone.setListState();
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
