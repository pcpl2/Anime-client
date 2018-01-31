class gogoanimeioClass extends serviceSupportImpl {
    constructor() {
        super("https://ww4.gogoanime.io", {});
        const self = this;

        request({ url: self.domain, headers: app.defaultHeaders }, (error, response, body) => {
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

                self.serviceData = { api: self, id: "gogoanimeIo", name: metaTitle.attributes.content.nodeValue, description: metaDescription.attributes.content.nodeValue, lang: "EN", image: logo };
                sm.list.push({ api: self, id: "gogoanimeIo" });
                m.redraw();
            } else {
                console.error(error);
            }
        });
    }

    updateAnimeList() {
        const self = this;
        let animeListJson = cacheJS.get({
            serviceID: self.serviceData.id,
            type: 'Json'
        });

        if (animeListJson == null) {
            const startUrl = `${self.domain}/anime-list.html?page=`

            var titleObjectList = [];

            const completeCallback = () => {
                let sorted = _.sortBy(titleObjectList, 'title');

                self.animeList = sorted;

                cacheJS.set({ serviceID: self.serviceData.id, type: 'Json' }, JSON.stringify(self.animeList), 86400);

                self.animeListFiltered = self.animeList;
                self.setListState();
            }

            self.runRequest(startUrl, 1, completeCallback, titleObjectList);

        } else {
            self.animeList = JSON.parse(animeListJson);
            self.animeListFiltered = self.animeList;
            self.setListState();
        }
    }

    runRequest(url, pageId, completeCallback, titleObjects) {
        const self = this;

        const urlForRequest = url + pageId;

        request({ url: urlForRequest, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const baseHtmlList = $(parseHtml(body)).find("ul.listing");
                const listHtml = baseHtmlList.find("li");

                _.each(listHtml, (item, indexItem) => {
                    const htmlObj2 = $(parseHtml(item.title));
                    const htmlObj = item.children[0];
                    let obj = {
                        id: htmlObj.getAttribute("href").split("/").pop(),
                        url: self.domain + htmlObj.getAttribute("href"),
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
    }
    
    updateCurrentAnimeData() {
        const self = this;

        request({ url: self.selectedAnime.url, headers: app.defaultHeaders }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const parsedBody = $(parseHtml(body));
                const moveId = parsedBody.find("input#movie_id").val();
                const lastEpNumber = parsedBody.find(".anime_video_body > #episode_page > li:last-child > a").attr("ep_end");

                const urlForApi = `https://ww4.gogoanime.io/load-list-episode?ep_start=0&ep_end=${lastEpNumber}&id=${moveId}&default_ep=0`;

                request({ url: urlForApi, headers: app.defaultHeaders }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const parsedBodyApi = $(parseHtml(body)).find("#episode_related");

                        var episodeList = [];

                        _.each(parsedBodyApi.children(), (item, indexItem) => {
                            let obj = {
                                id: item.children[0].href.split("/").pop(),
                                url: self.domain + "/" + item.children[0].href.split("/").pop(),
                                title: item.children[0].children[0].innerText.trim(),
                                players: []
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
    }

    updateCurrentEpisodeData() {
        const self = this;

        if(self.selectedEpisode != null) {
            self.selectedEpisode.players = [];
        }

        const url = self.selectedEpisode.url;

        request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
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
                                id: name.replace(/\s/g, '').toLowerCase() + "_" + indexItem,
                                url: videoUrl,
                                lang: "EN",
                                name: name,
                                desc: "-",
                                referer: url
                            }

                            self.selectedEpisode.players.push(obj);
                        }
                    }
                });
                m.redraw();
            } else {
                //ServiceSupport.currentServiceStatus = ServiceStatus.ERROR;
            }
        });
    }

}
