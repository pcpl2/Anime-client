var episodePlayBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService + "/list", oncreate: m.route.link }, ServiceSupport.currentServiceName),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService + "/anime/" + ServiceSupport.getServiceFunction().currentAnimeId + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().currentAnimeTitle),
            m("span", { "class": "breadcrumb-item active" }, ServiceSupport.getServiceFunction().currentEpisodeTitle)
        ]
    }
};

var episodePlayHeader = {
    view: function () {
        return m("span", ServiceSupport.getServiceFunction().currentEpisodeTitle);
    }
};

var episodePlayBody = {
    view: function () {
        return m(".episodePlay", { "class": "col-md-12", "style": "margin-top: 1%; margin-bootom: 1%" },
            [

                //Next previous episodes
                m("div", {"class": "row"}, [
                    m("div", {"class": "col align-self-start"}, [
                        m("button", { "class": "btn btn-primary pull-left" }, "Previous episode")
                    ]),

                    m("div", {"class": "col align-self-center"}, [
                        m("span", "dupa")
                    ]),

                     m("div", {"class": "col align-self-end"}, [
                        m("button", { "class": "btn btn-primary pull-right" }, "Next episode")
                    ]),
                ]),

                //Players button



                //Player


            ]
        );
    }
};

this.EpisodePlay = {
    oninit: function (vnode) {
        console.log(vnode.attrs);
        if (!vnode.attrs.sid) {
            m.route.set("/");
        }

        if (!vnode.attrs.aid) {
            m.route.set("/");
        }

        if (!vnode.attrs.eid) {
            m.route.set("/");
        }

        if (!ServiceSupport.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        if (!ServiceSupport.getServiceFunction().setCurrentAnime(vnode.attrs.aid)) {
            m.route.set("/");
        }

        if (!ServiceSupport.getServiceFunction().setCurrentEpisode(vnode.attrs.eid)) {
            m.route.set("/");
        }

    },
    view: function () {
        return layout(m(episodePlayBreadcrumb), m(episodePlayHeader), m(episodePlayBody));
    }
}
