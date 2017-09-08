var animeListBreadcrumb = {
    view: function () {
        return [m("a", { "class": "breadcrumb-item active", href: "/", oncreate: m.route.link }, "SelectService"), m("span", { "class": "breadcrumb-item" }, m("span", ServiceSupport.currentServiceName) )]
    }
};

var animeListHeader = {
    view: function () {
        return m("span", "Select anime");
    }
};

var animeListBody = {
    view: function () {
        return m(".animeList", { "class": "col-md-12 card-group" }, 
            ServiceSupport.getServiceFunction().animeList.map(function (anime) {
                return m("div", { "class": "col-md-4" },  [PageCard.animeCard(anime.id,
                    anime.title)]);
            }));
    }
};

this.AnimeList = {
    oninit: function (vnode) {
        console.log(vnode.attrs);
        if (vnode.attrs.sid) {
            if (ServiceSupport.setCurrentService(vnode.attrs.sid)) {
                ServiceSupport.getServiceFunction().updateAnimeList();
            } else {
                m.route.set("/");
            }
        } else {
            m.route.set("/");
        }
    },
    view: function () {
        return layout(m(animeListBreadcrumb), m(animeListHeader), m(animeListBody));
    }
}