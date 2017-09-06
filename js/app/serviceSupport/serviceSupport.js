serviceSupport = {
    list: [],
    updateAONinjaData: function () {
        return m.request({
            method: "GET",
            url: "https://a-o.ninja/",
            deserialize: function (value) { return value },
        }).then(function (res) {
            console.log($(res).find(".navbar-header").find(".logo").find("img").attr('src'));
            serviceSupport.list.push({ id: "aoninja", name: "A-O.NINJA", description: "", image: $(res).find(".navbar-header").find(".logo").find("img").attr('src') })
            m.redraw();
        })
    }
};