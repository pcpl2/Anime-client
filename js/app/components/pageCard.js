this.PageCard = {
    serviceCard: function (logo, name, description, url) {
        return m("div", { "class": "card", "style": "width: 20rem;" }, [
            m("img", { "class": "card-img-top", "src": logo, "alt": name + " logo", "style": "background: black;" }),
            m("div", { "class": "card-body" }, [
                m("h4", { "class": "card-title" }, name),
                m("p", { "class": "card-text" }, description),
                m("a", { "class": "btn btn-primary", "href": "/service/" + url + "/list", oncreate: m.route.link }, "Select")
            ])
        ]);
    },

    animeCard: function (id, name) {
        return m("div", { "class": "card text-white bg-info mb-3", "style": "max-width: 20rem;", "onclick": function() {m.route.set("/" + id);} }, [
            m("div", { "class": "card-body" }, [
                m("h4", { "class": "cart-title" }, name)
            ])
        ]);
    }
}
