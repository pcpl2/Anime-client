class aoninjaClass extends serviceSupportImpl {
    constructor() {
        super("https://a-o.ninja", {});
        const self = this;

        request({ url: self.domain, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode == 200) {

                const logo = $(parseHtml(body)).find(".navbar-header > .logo > img").attr('src')
                self.serviceData = { api: self, id: "aoninja", name: "A-O.NINJA", description: "", lang: "PL", image: logo };
                sm.list.push({ api: self, id: "aoninja" });

                m.redraw();

            } else {
                console.error(error);
            }
        });
    }

    updateAnimeList() {
        const self = this;

        const animeListJson = cacheJS.get({
            serviceID: this.serviceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            const urls = ['https://a-o.ninja/anime', 'https://a-o.ninja/filmy'];
            var completeRequests = 0;
            var titleObjectList = [];

            const completeCallback = () => {
                const sorted = _.sortBy(titleObjectList, 'title');

                self.animeList = sorted;

                cacheJS.set({ serviceID: self.serviceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400);

                self.animeListFiltered = self.animeList;
                self.setListState();
            }

            _.each(urls, (url, indexUrl) => {
                request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const listHtml = $(parseHtml(body)).find(".list-item > td > a");;

                        _.each(listHtml, (item, indexItem) => {
                            let title = item.innerHTML;
                            const emailProtect = item.querySelector('.__cf_email__');

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
            self.animeList = JSON.parse(animeListJson);
            self.animeListFiltered = self.animeList;
            self.setListState();
        }
    }

    updateCurrentAnimeData() {
        const self = this;

        request({ url: self.currentAnime.url, headers: app.defaultHeaders }, (error, response, body) => {
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

                    const obj = {
                        id: item.getAttribute("href").split("/").pop(),
                        url: item.getAttribute("href"),
                        title: title
                    };

                    episodeList.push(obj);
                });
                self.episodeList = episodeList.reverse();

                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    }

    updateCurrentAnimeData() {
        const self = this;

        request({ url: self.selectedAnime.url, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find(".lista_odc_tytul_pozycja > a");

                var episodeList = [];

                _.each(listHtml, (item, indexItem) => {
                    let title = item.innerHTML;
                    let emailProtect = item.querySelector('.__cf_email__');

                    if (emailProtect) {
                        emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                        title = item.innerHTML;
                    }

                    var obj = {
                        id: item.getAttribute("href").split("/").pop(),
                        url: item.getAttribute("href"),
                        title: title,
                        players: []
                    };

                    episodeList.push(obj);
                });
                self.episodeList = episodeList.reverse();

                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    }

    updateCurrentEpisodeData() {
        const self = this;
        if (self.selectedEpisode != null) {
            self.selectedEpisode.players = [];
        }

        const url = self.selectedEpisode.url;
        request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("#video-player-control > div");

                _.each(listHtml, (item, indexItem) => {
                    const obj = {
                        id: item.innerHTML.replace(/\s/g, '').toLowerCase() + "_" + indexItem,
                        url: JSON.parse(CryptoJS.DES.decrypt(item.getAttribute('data-hash'), "s05z9Gpd=syG^7{", { format: d }).toString(CryptoJS.enc.Utf8)),
                        lang: "PL",
                        name: item.innerHTML.trim(),
                        desc: "-",
                        referer: url
                    }

                    console.log(obj)
                    self.selectedEpisode.players.push(obj);
                });
                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    }
}
