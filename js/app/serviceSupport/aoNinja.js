this.AONinja = {
    animeList: [],
    currentAnimeId: "",
    currentAnimeTitle: "",
    currentAnimeExistImg: false,
    currentAnimeImage: "",
    currentAnimeExistDes: false,
    currentAnimeDescryption: "",
    episodeList: [],
    currentEpisodeId: "",

    updateAnimeList: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/anime",
            headers: {
                "Accept": "text/html"
            },
            deserialize: function (value) { return value },
        }).then(function (res) {
            var animeListHtml = $(res).find(".list-item").find("td").find("a");

            var animeList = animeListHtml.map(function () {
                var title = this.innerHTML;
                var emailProtect = this.querySelector('.__cf_email__');
                if (emailProtect) {
                    emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                    title = this.innerHTML;
                }
                console.log(this.getAttribute("href") + " -> " + title);
                return { id: this.getAttribute("href").split("/").pop(), url: this.getAttribute("href"), title: title };
            }).get();

            AONinja.animeList = animeList;
            console.log(animeList);
            console.log("A-O.ninja anime list data loaded")
        })
    },

    setCurrentAnime: function (id) {
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
        AONinja.episodeList = "";
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
            var episodeListHtml = $(res).find(".lista_odc_tytul_pozycja").find("a");

            AONinja.episodeList = episodeListHtml.map(function () {
                var title = this.innerHTML;
                var emailProtect = this.querySelector('.__cf_email__');
                if (emailProtect) {
                    emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                    title = this.innerHTML;
                }
                console.log({ id: this.getAttribute("href").split("/").pop(), url: this.getAttribute("href"), title: title })
                return { id: this.getAttribute("href").split("/").pop(), url: this.getAttribute("href"), title: title };
            }).get();

            AONinja.episodeList = AONinja.episodeList.reverse();

            console.log("A-O.ninja anime list data loaded")
        })
    }
};
