m.route(document.getElementById("application"), "", {
    "/service/:sid/list": AnimeList,
    //"/service/:sid/anime/:aid/list": AnimeEpisodeList,
    //"/service/:sid/anime/:aid/episode/:eid": AnimeEpisodeList,
    "": SelectService
})
