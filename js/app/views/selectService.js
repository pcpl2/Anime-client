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
            sm.list.map(function (service) {
                return m("div", { class: "col-sm-5" }, m(PageCard.serviceCard, { service: service }));
            }));
    }
};

this.SelectService = {
    oninit: function (vnode) {
        sm.clearCurrentService();
        sm.updateServiceList();

        VideoServiceSupport.updateVideoServiceList();
    },

    view: function () {
        return layout(m(selectServiceBreadcrumb), m(selectServiceHeader), m(selectServiceList));
    }
}