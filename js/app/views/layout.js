Navbar = {
    view: function () {
        return m("nav", { "class": "navbar navbar-dark bg-dark justify-content-between" }, [
            m("strong", { "class": "navbar-brand" }, "Anime Client")
        ]);
    }
};

layout = function (breadcrumb, header, content) {
    return m("div", [
        m(Navbar),
        m("div", { "class": "container" }, [
            m("nav", {"class": "breadcrumb"}, [breadcrumb]),
            m("div", { "class": "card fancy", "style": "margin-top:1%" }, [
                m("div", { "class": "card-header" }, [header]),
                m("div", { "class": "card-block" }, [content])
            ])
        ])
    ]);
};