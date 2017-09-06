selectService = {
    view: function () {
        return layout(
            [m("span", { "class": "breadcrumb-item active" }, "SelectService")],
            m("span", "Select Page"),
            m("div", {}, [
                serviceSupport.list.map(function (service) {
                    pageCard(service.image,
                        service.name,
                        service.description,
                        service.id)
                })
            ])
        );
    }
};

SelectService = {
    oninit: function(vnode) {
        serviceSupport.updateAONinjaData();
        m.redraw();
    },
    view: function () {
        return m(selectService);
    }
}