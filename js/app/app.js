var root = document.getElementById("application")

m.route(root, "", {
    //"/service/:sid/list": AnimeList,
    //"/service/:sid/anime/:aid/list": AnimeEpisodeList,
    //"/service/:sid/anime/:aid/episode/:eid": AnimeEpisodeList,
    "": SelectService
})