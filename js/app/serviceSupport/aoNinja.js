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
                var title = this.innerHTML;
                var emailProtect = this.querySelector('.__cf_email__');
                if (emailProtect) {
                    emailProtect.parentNode.replaceChild(document.createTextNode(DecodeCloudflareEmailProtect(emailProtect.getAttribute('data-cfemail'), 0)), emailProtect);
                    title = this.innerHTML;
                }
                console.log(this.getAttribute("href") + " -> " + this.innerHTML);
                return { id: this.getAttribute("href").split("/").pop(), url: this.getAttribute("href"), title: title };
            }).get();

            AONinja.animeList = animeList;
            console.log(animeList);
            console.log("A-O.ninja anime list data loaded")
        })
    }
};