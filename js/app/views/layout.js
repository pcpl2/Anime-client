layout = function (breadcrumb, header, content) {
    return m("div", [
        m("nav", { "class": "breadcrumb" }, [breadcrumb]),
        m("div", { "class": "container" }, [
            m("div", { "class": "card fancy", "style": "margin-top:1%; min-height: 50%;" }, [
                m("div", { "class": "card-header" }, [header]),
                m("div", { "class": "card-block" }, [content])
            ])
        ])
    ]);
};
