var episodeListBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + sm.getApi().serviceData.id + "/list", oncreate: m.route.link }, m("span", sm.getApi().serviceData.name)),
            m("span", { "class": "breadcrumb-item active" }, m("span", sm.getApi().selectedAnime.title))
        ]
    }
};

var episodeListHeader = {
    view: function () {
        return m("label", { "class": "col-form-label col-md-12" }, sm.getApi().selectedAnime.title + " -> select episode");
    }
};

var episodeListBody = {
    view: function () {
        return m(".episodeList", { "class": "col-md-12 card-group", "style": "margin-top: 1%; margin-bootom:1%" },
            //TODO add anime image and description
            sm.getApi().episodeList.map(function (episode) {
                return m("div", { "class": "col-md-4" }, [
                    PageCard.episodeCard(episode.id,
                    episode.title,
                    sm.getApi().selectedAnime.id,
                    sm.getApi().serviceData.id)]);
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

        if (!sm.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        if (!sm.getApi().setCurrentAnime(vnode.attrs.aid)) {
            m.route.set("/");
        }

    },
    view: function () {
        return layout(m(episodeListBreadcrumb), m(episodeListHeader), m(episodeListBody));
    }/*,
    onbeforeremove: function(vnode) {
        ServiceSupport.getServiceFunction().clearCurrentAnime();
    },*/
}
