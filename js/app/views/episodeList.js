var episodeListBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService + "/list", oncreate: m.route.link }, m("span", ServiceSupport.currentServiceName)),
            m("span", { "class": "breadcrumb-item active" }, m("span", ServiceSupport.getServiceFunction().currentAnimeTitle))
        ]
    }
};

var episodeListHeader = {
    view: function () {
        return m("span", ServiceSupport.getServiceFunction().currentAnimeTitle + " -> select episode");
    }
};

var episodeListBody = {
    view: function () {
        return m(".episodeList", { "class": "col-md-12 card-group", "style": "margin-top: 1%;" },
            //TODO add anime image and description
            ServiceSupport.getServiceFunction().episodeList.map(function (episode) {
                return m("div", { "class": "col-md-4" }, [PageCard.episodeCard(episode.id,
                    episode.title,
                    ServiceSupport.getServiceFunction().currentAnimeId,
                    ServiceSupport.currentService)]);
            })
        );
    }
};

this.EpisodeList = {
    oninit: function (vnode) {
        console.log(vnode.attrs);
        if (!vnode.attrs.sid) {
            m.route.set("/");
        }

        if (!vnode.attrs.aid) {
            m.route.set("/");
        }

        if (!ServiceSupport.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        if (!ServiceSupport.getServiceFunction().setCurrentAnime(vnode.attrs.aid)) {
            m.route.set("/");
        }

    },
    view: function () {
        return layout(m(episodeListBreadcrumb), m(episodeListHeader), m(episodeListBody));
    }
}
