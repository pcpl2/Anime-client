this.AONinja = {
    animeList: [],
    currentAnimeId: "",
    
    updateAnimeList: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/anime",
            deserialize: function (value) { return value },
        }).then(function (res) {
            var animeListHtml = $(res).find(".list-item").find("td").find("a");

            var animeList = animeListHtml.map(function () {
                console.log(this.getAttribute("href") + " -> " + this.innerHTML)
                return { id: this.getAttribute("href").split("/").pop(), url: this.getAttribute("href"), title: this.innerHTML };
            }).get();

            AONinja.animeList = animeList;
            console.log(animeList);
            console.log("A-O.ninja anime list data loaded")
        })
    }
};