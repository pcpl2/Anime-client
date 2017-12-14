const http = require('http');
const phantom = require('phantom');

this.AnimeZone = {
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
        var self = this;
        return m.request({
            method: "GET",
            url: "http://animezone.pl/",
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            //const getImageFromCss = /[:,\s]\s*url\s*\(\s*(?:'(\S*?)'|"(\S*?)"|((?:\\\s|\\\)|\\\"|\\\'|\S)*?))\s*\)/igm;

            //console.log($(parseHtml(res)).find(".logo")[0].css( "background" ));

            //let logo = getImageFromCss.exec($(parseHtml(res)).find(".logo").css( "background" ));

            self.currentServiceData = { api: self, id: "animezone", name: "AnimeZone.pl", description: "", lang: "PL", image: "http://www.animezone.pl/resources/images/sprites.png" };
            ServiceSupport.list.push({ api: self, id: "animezone" })
        })
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
            serviceID: AnimeZone.currentServiceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            m.request({
                method: "GET",
                url: "http://www.animezone.pl/anime/lista",
                headers: {
                    "Accept": "text/html"
                },
                deserialize: function (value) { return value },
            }).then(function (res) {
                let parsedHtml = $(parseHtml(res));
                let pagination = parsedHtml.find(".pagination");
                var urls = parsedHtml.find(".anime-list").find("div").find("a").map(function () {
                    return "http://www.animezone.pl" + this.getAttribute("href");
                });

                if (pagination.length > 0 && !(urls[0].includes("?page="))) {
                    let pagesLi = pagination.find("li");
                    let pagesNumber = parseInt(pagesLi[(pagesLi.length - 2)].innerText);
                    for (var i = 1; i <= pagesNumber; i++) {
                        urls.push(urls[0] + "?page=" + i);
                    }
                }

                let animeToAdd = parsedHtml.find(".categories-newest").find(".categories").find(".description").map(function () {
                    let title = this.childNodes[1].childNodes[1].innerHTML;
                    let shortUrl = this.childNodes[1].childNodes[1].getAttribute("href");
                    let fullUrl = "http://www.animezone.pl" + shortUrl;

                    let obj = {
                        id: shortUrl.split("/").pop(),
                        url: fullUrl,
                        title: title
                    };
                    return obj;
                }).get();

                self.animeList = self.animeList.concat(animeToAdd);

                urls.splice(0, 1);
                self.runRequest(urls);
            }).catch(function (e) {
                ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            });
        } else {
            AnimeZone.animeList = JSON.parse(animeListJson);
            AnimeZone.animeListFiltered = AnimeZone.animeList;
            AnimeZone.setListState();
        }
    },

    runRequest(urls) {
        var self = this;
        m.request({
            method: "GET",
            url: urls[0],
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let parsedHtml = $(parseHtml(res));
            let pagination = parsedHtml.find(".pagination");

            if (pagination.length > 0 && !(urls[0].includes("?page="))) {
                let pagesLi = pagination.find("li");
                let pagesNumber = parseInt(pagesLi[(pagesLi.length - 2)].innerText);
                for (var i = 1; i <= pagesNumber; i++) {
                    urls.push(urls[0] + "?page=" + i);
                }
            }

            let animeToAdd = parsedHtml.find(".categories-newest").find(".categories").find(".description").map(function () {
                let title = this.childNodes[1].childNodes[1].innerHTML;
                let shortUrl = this.childNodes[1].childNodes[1].getAttribute("href");
                let fullUrl = "http://www.animezone.pl" + shortUrl;

                let obj = {
                    id: shortUrl.split("/").pop(),
                    url: fullUrl,
                    title: title
                };
                return obj;
            }).get();

            self.animeList = self.animeList.concat(animeToAdd);

            if (urls.length > 1) {
                urls.splice(0, 1);
                self.runRequest(urls);
            } else {
                self.completeRequest();
            }
        })
    },

    completeRequest() {
        var self = this;
        self.animeList = _.sortBy(self.animeList, function (obj) { return obj.title; });

        cacheJS.set({ serviceID: AnimeZone.currentServiceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400);

        self.animeListFiltered = self.animeList;
        AnimeZone.setListState();
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
        return m.request({
            method: "GET",
            url: self.currentAnime.url,
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            let episodeListHtml = $(parseHtml(res)).find(".episodes").find("tbody").find("tr");

            self.episodeList = episodeListHtml.map(function () {
                let title = this.children[0].innerText + " - " + this.children[1].innerText;
                let tmpUrl = this.children[4].children[0].getAttribute("href");
                let url = "/" + tmpUrl.split("/").splice(1, 3).join("/");

                let obj = {
                    id: url.split("/").pop(),
                    url: url,
                    title: title
                };

                return obj;
            }).get();

            self.episodeList = self.episodeList.reverse();
        })
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
            self.currentEpisodePlaysers = [];
            self.updateCurrentEpisodeData();
            return true;
        } else {
            return false;
        }
    },

    async updateCurrentEpisodeData() {
        var self = this;
        var episode = _.find(self.episodeList, function (episode) { return episode.id == self.currentEpisodeId; });
        var episodeUrl = "http://www.animezone.pl" + episode.url;

        const instance = await phantom.create();
        
        const page = await instance.createPage();
        const status = await page.open(episodeUrl);
        const pageContent = await page.property('content');
        const pageCookies = await page.cookies();

        var cookieObj = _.find(pageCookies, function (obj) { return obj.name == "_SESS"; });
        var cookie = cookieObj.value;

        let playersListHtml = $(parseHtml(pageContent)).find("table.episode").find("tbody").children();

        var i = 0;

        playersListHtml.map(function () {

            let dataForUrlPost = {
                url: episodeUrl,
                cookie: cookie,
                data: this.children[3].children[0].attributes[1].nodeValue
            }

            var playerAllInfo = {
                id: this.children[0].innerHTML.replace(/\s/g, '').toLowerCase() + i,
                url: dataForUrlPost,
                lang: this.children[2].children[0].getAttribute('class').split(" ")[1],
                name: this.children[0].innerText.trim(),
                desc: this.children[1].innerHTML.trim()
            };

            self.addPlayerToList(playerAllInfo);

            i++;
        });
    },

    addPlayerToList(playerAllInfo) {
        let parser = document.createElement("a");
        parser.href = playerAllInfo.url.url;

        var host = parser.hostname;
        var path = parser.pathname;

        var data = "data=" + playerAllInfo.url.data

        var options = {
            host: host,
            path: path,
            port: 80,
            method: 'POST',
            headers: {
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'Referer': playerAllInfo.url.url,
                'Cookie': "_SESS=" + playerAllInfo.url.cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36'
            }
        };

        var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                let obj = $(parseHtml(chunk));
                let a = obj.find("html > body > a");
                let iframe = obj.find("html > body > iframe");
                let playerObj = {
                    id: playerAllInfo.id,
                    url: "",
                    lang: playerAllInfo.lang,
                    name: playerAllInfo.name,
                    desc: playerAllInfo.desc
                }

                if (a.length > 0) {
                    //console.log(a[0].href);
                    var url = a[0].href.replace("chrome-extension:", "http:");
                    playerObj.url = url;

                } else if (iframe.length > 0) {
                    //console.log(iframe[0].src);
                    var url = iframe[0].src.replace("chrome-extension:", "http:");
                    playerObj.url = url;
                }

                AnimeZone.currentEpisodePlaysers.push(playerObj);
                //console.log("added");
                console.log(playerObj);
                m.redraw();

            });
        });
        req.write(data);

        req.on('error', function (err) {
            console.debug('message: ' + err.message);
            console.debug('name: ' + err.name);
            console.debug('stack: ' + err.stack);
        });

        req.end();
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
        AnimeZone.animeListFiltered = _.filter(AnimeZone.animeList, function (obj) { return text.trim().length == 0 ? true : obj.title.toLowerCase().includes(text.trim().toLowerCase()); });
        AnimeZone.setListState();
    },

    clearSearchAnime: function () {
        this.animeListFiltered = this.animeList;
    },

    setListState() {
        if(this.animeListFiltered.length > 0) {
            ServiceSupport.currentServiceStatus = ServiceStatus.LOADED;
        } else {
            ServiceSupport.currentServiceStatus = ServiceStatus.EMPTY;
        }
        m.redraw();
    }
}
