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
        return m(".serviceList", { class: "row col-md-12" },
            ServiceSupport.list.map(function (service) {
                return m("div", m(PageCard.serviceCard, { service: service }));
            }));
    }
};

this.SelectService = {
    oninit: function (vnode) {
        ServiceSupport.clearCurrentService();
        ServiceSupport.updateServiceList();

        VideoServiceSupport.updateVideoServiceList();
    },

    view: function () {
        return layout(m(selectServiceBreadcrumb), m(selectServiceHeader), m(selectServiceList));
    }
}