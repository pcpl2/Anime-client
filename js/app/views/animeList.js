var animeListBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("span", { "class": "breadcrumb-item active" }, m("span", sm.getApi().serviceData.name))
        ]
    }
};

var animeListHeader = {
    view: function () {
        return m("div", {}, [
            m("label", { "class": "col-form-label col-md-2" }, "Select anime"),
            m("label", { "class": "col-form-label col-md-4", style: ["display:", sm.getApi().serviceStatus != ServiceStatus.LOADED ? " none" : ""].join("") }, "Showing " + sm.getApi().animeListFiltered.length.toLocaleString() + " of " + sm.getApi().animeList.length.toLocaleString() + " anime"),
            m("input", { "class": "form-control col-md-4 pull-right", "oninput": m.withAttr("value", (val) => { sm.getApi().searchAnime(val) }), "placeholder": "Search" })
        ]);
    }
};

var animeListBody = {
    view: function () {
        return m("div", [
            //Loading
            m("div", { class: "loader", style: ["margin: auto; position: relative; margin-top:10%; display:", sm.getApi().serviceStatus === ServiceStatus.LOADING ? " block" : " none"].join("") }, ""),
            //Loaded
            m("div", { style: ["display:", sm.getApi().serviceStatus === ServiceStatus.LOADED ? " block" : " none"].join("") },
                m(".animeList", { "class": "col-md-12 card-group", "style": "margin-top: 1%;" },
                    sm.getApi().animeListFiltered.map(function (anime) {
                        return m("div", { "class": "col-md-4" }, [
                            PageCard.animeCard(anime.id,
                                anime.title,
                                sm.getApi().serviceData.id)
                        ]);
                    }))),
            //Empty
            m("div", { style: ["display:", sm.getApi().serviceStatus === ServiceStatus.EMPTY ? " block" : " none"].join("") }, [
                m("h2", { style: "margin: auto; text-align: center; margin-top:10%;" }, "The anime list is empty.")
            ]),
            //Error
            m("div", { style: ["display:", sm.getApi().serviceStatus === ServiceStatus.ERROR ? " block" : " none"].join("") }, [
                m("h2", { style: "margin: auto; text-align: center; margin-top:10%;" }, "An error occurred while loading the anime list.")
            ])
        ])
    }
};

this.AnimeList = {
    oninit: function (vnode) {
        //console.log(vnode.attrs);
        if (!vnode.attrs.sid) {
            m.route.set("/");
        }

        if (!sm.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        sm.getApi().clearSearchAnime();
    },
    view: function () {
        return layout(m(animeListBreadcrumb), m(animeListHeader), m(animeListBody));
    }
}
