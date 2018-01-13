this.PageCard = {
    serviceCard: {
        id: "",
        name: "",
        description: "",
        lang: "",
        image: "",

        oninit: function(vnode) {
            var self = this;

            self.name = vnode.attrs.service.api.currentServiceData.name;
            self.description = vnode.attrs.service.api.currentServiceData.description;
            self.lang = vnode.attrs.service.api.currentServiceData.lang;
            self.id = vnode.attrs.service.id;

            vnode.attrs.service.api.getImageFunction(function(image) {
                self.image = image;
                m.redraw( );
            });
        },

        view: function(vnode) {
            var self = this;
            return m("div", { "class": "card", "style": "width: 20rem; height: 15rem; margin: 3%;" }, [
                m("img", { "class": "card-img-top", "src": self.image, "alt": self.name + " logo", "style": "background: black; height: 25%;" }),
                m("div", { "class": "card-body" }, [
                    m("span", {class: "badge badge-primary pull-right"}, m("span", {class: "lang-sm", "lang": self.lang.toLowerCase()})),
                    m("h4", { "class": "card-title" }, self.name),
                    m("p", { "class": "card-text" }, self.description),
                    m("a", { "class": "btn btn-raised btn-primary", "href": "/service/" + self.id + "/list", oncreate: m.route.link }, "Select")
                ])
            ]);
        }
    },

    animeCard: function (id, name, service) {
        return m("div", { "class": "card text-white bg-info mb-3", "style": "max-width: 20rem; min-height: 180px;", "onclick": function () { m.route.set("/service/" + service + "/anime/" + id + "/list"); } }, [
            m("div", { "class": "card-body" }, [
                m("h4", { "class": "cart-title", "style": "text-align: center;" }, name)
            ])
        ]);
    },

    episodeCard: function (id, name, anime, service) {
        return m("button", {
            "class": "btn btn-raised btn-info btn-lg btn-block",
            "style": "min-height: 180px; margin-top:1%; margin-bootom:1%; white-space: normal;",
            "onclick": function () { m.route.set("/service/" + service + "/anime/" + anime + "/episode/" + id); }
        }, name);
    }
}
