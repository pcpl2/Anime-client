var selectServiceBreadcrumb = {
    view: function () {
        return [m("span", { "class": "breadcrumb-item active" }, "SelectService")]
    }
};

var selectServiceHeader = {
    view: function () {
        return m("label", { "class": "col-form-label col-md-2" }, "Select service");
    }
};

var selectServiceList = {
    view: function () {
        return m(".serviceList",
            ServiceSupport.list.map(function (service) {
                return m("div", [PageCard.serviceCard(service.image,
                    service.name,
                    service.description,
                    service.id)]);
            }));
    }
};

this.SelectService = {
    oninit: function (vnode) {
        ServiceSupport.clearCurrentService();
        ServiceSupport.updateServiceList();
    },

    view: function () {
        return layout(m(selectServiceBreadcrumb), m(selectServiceHeader), m(selectServiceList));
    }
}