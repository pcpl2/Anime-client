m.route(document.getElementById("application"), "", {
    "/service/:sid/list": AnimeList,
    "/service/:sid/anime/:aid/list": EpisodeList,
    //"/service/:sid/anime/:aid/episode/:eid": AnimeEpisodeList,
    "": SelectService
})
