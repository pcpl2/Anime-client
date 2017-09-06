SelectService = {
  view: function() {
    return layout(
        [m("span", {"class":"breadcrumb-item active"}, "SelectService")],
        m("span", "Select Page"),
        m("div", {}, pageCard("https://a-o.ninja/wp-content/uploads/2017/07/A-O_logo.png", 
            "A-O.NINJA", 
            "A-O.NINJA - ANIME PL FULL HD - ONLINE! - Anime Online PL HD, ANIME PL - FULL HD Anime PL Online - Najnowsze Anime Po Polsku w HD, AnimePL, Anime Ninja PL HD",
            "#"))
    );
  }
};