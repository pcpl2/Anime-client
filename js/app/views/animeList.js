var animeListBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("span", { "class": "breadcrumb-item active" }, m("span", ServiceSupport.currentServiceName))
        ]
    }
};

var animeListHeader = {
    view: function () {
        return m("span", "Select anime");
    }
};

var animeListBody = {
    view: function () {
        return m(".animeList", { "class": "col-md-12 card-group", "style": "margin-top: 1%;" },
            ServiceSupport.getServiceFunction().animeList.map(function (anime) {
                return m("div", { "class": "col-md-4" }, [
                    PageCard.animeCard(anime.id,
                        anime.title,
                        ServiceSupport.currentService)
                ]);
            }));
    }
};

this.AnimeList = {
    oninit: function (vnode) {
        console.log(vnode.attrs);
        if (!vnode.attrs.sid) {
            m.route.set("/");
        }

        if (!ServiceSupport.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }
    },
    view: function () {
        return layout(m(animeListBreadcrumb), m(animeListHeader), m(animeListBody));
    }
}
