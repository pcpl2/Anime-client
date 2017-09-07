this.ServiceSupport = {
    list: [],
    updateAONinjaData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/",
            deserialize: function (value) { return value },
        }).then(function (res) {
            console.log($(res).find(".navbar-header").find(".logo").find("img").attr('src'));
            ServiceSupport.list.push({ id: "aoninja", name: "A-O.NINJA", description: "", image: $(res).find(".navbar-header").find(".logo").find("img").attr('src') })
            console.log("A-O.ninja data loaded")
        })
    }
};