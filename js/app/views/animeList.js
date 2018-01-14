var animeListBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("span", { "class": "breadcrumb-item active" }, m("span", ServiceSupport.currentService.api.serviceData.name))
        ]
    }
};

var animeListHeader = {
    view: function () {
        return m("div", {}, [
            m("label", { "class": "col-form-label col-md-2" }, "Select anime"),
            m("label", { "class": "col-form-label col-md-4", style: ["display:", ServiceSupport.currentServiceStatus != ServiceStatus.LOADED ? " none": ""].join("") }, "Showing " + ServiceSupport.getServiceFunction().animeListFiltered.length.toLocaleString() + " of " + ServiceSupport.getServiceFunction().animeList.length.toLocaleString() + " anime"),
            m("input", { "class": "form-control col-md-4 pull-right", "oninput": m.withAttr("value", (val) => {ServiceSupport.getServiceFunction().searchAnime(val)}), "placeholder": "Search" })
        ]);
    }
};

var animeListBody = {
    view: function () {
        return m("div", [
            //Loading
            m("div", { class: "loader", style: ["margin: auto; position: relative; margin-top:10%; display:", ServiceSupport.currentServiceStatus === ServiceStatus.LOADING ? " block" : " none"].join("") }, ""),
            //Loaded
            m("div", { style: ["display:", ServiceSupport.currentServiceStatus === ServiceStatus.LOADED ? " block" : " none"].join("") },
                m(".animeList", { "class": "col-md-12 card-group", "style": "margin-top: 1%;" },
                    ServiceSupport.getServiceFunction().animeListFiltered.map(function (anime) {
                        return m("div", { "class": "col-md-4" }, [
                            PageCard.animeCard(anime.id,
                                anime.title,
                                ServiceSupport.currentService.id)
                        ]);
                    }))),
            //Empty
            m("div", { style: ["display:", ServiceSupport.currentServiceStatus === ServiceStatus.EMPTY ? " block" : " none"].join("") }, [
                m("h2", { style: "margin: auto; text-align: center; margin-top:10%;" }, "The anime list is empty.")
            ]),
            //Error
            m("div", { style: ["display:", ServiceSupport.currentServiceStatus === ServiceStatus.ERROR ? " block" : " none"].join("") }, [
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

        if (!ServiceSupport.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        ServiceSupport.getServiceFunction().clearSearchAnime();
    },
    view: function () {
        return layout(m(animeListBreadcrumb), m(animeListHeader), m(animeListBody));
    }
}
