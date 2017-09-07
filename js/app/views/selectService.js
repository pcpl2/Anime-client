var selectServiceBreadcrumb = {
    view: function () {
        return [m("span", { "class": "breadcrumb-item active" }, "SelectService")]
    }
};

var selectServiceHeader = {
    view: function () {
        return m("span", "Select service");
    }
};

var selectServiceList = {
    view: function () {
        return m(".serliveList",
            ServiceSupport.list.map(function (service) {
                return m("div", { "class": "card", "style": "width: 20rem;" }, [
                    m("img", { "class": "card-img-top", "src": service.image, "alt": service.name + " logo", "style": "background: black;" }),
                    m("div", { "class": "card-body" }, [
                        m("h4", { "class": "card-title" }, service.name),
                        m("p", { "class": "card-text" }, service.description),
                        m("a", { "class": "btn btn-primary", "href": "/service/" + service.id + "/list", oncreate: m.route.link }, "Select")
                    ])
                ]);
            }));
    }
};

this.SelectService = {
    oninit: ServiceSupport.updateAONinjaData(),
    view: function () {
        return layout(m(selectServiceBreadcrumb), m(selectServiceHeader), m(selectServiceList));
    }
}