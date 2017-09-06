pageCard = function (logo, name, description, url) {
    return m("div", { "class": "card", "style": "width: 20rem;" }, [
        m("img", { "class": "card-img-top", "src": logo, "alt": name + " logo", "style":"background: black;" }),
        m("div", { "class": "card-body" }, [
            m("h4", { "class": "card-title" }, name),
            m("p", { "class": "card-text" }, description),
            m("a", { "class": "btn btn-primary", "href": url }, "Select")
        ])
    ]);
}