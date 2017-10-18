var episodePlayBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentServiceId + "/list", oncreate: m.route.link }, ServiceSupport.currentServiceName),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentServiceId + "/anime/" + ServiceSupport.getServiceFunction().currentAnimeId + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().currentAnimeTitle),
            m("span", { "class": "breadcrumb-item active" }, ServiceSupport.getServiceFunction().currentEpisodeTitle)
        ]
    }
};

var episodePlayHeader = {
    view: function () {
        return m("span", ServiceSupport.getServiceFunction().currentEpisodeTitle);
    }
};

var episodePlayBody = {
    video: null,
    currentPlayerId: "",
    clearPlayer: function () {
        episodePlayBody.currentPlayerId = "";
        if (episodePlayBody.video != null) {
            episodePlayBody.video.dispose();
            episodePlayBody.video = null;
        }

        $("#custom-player").remove();
        $("#iframe-player").remove();
    },
    initPlayer: function () {
        if (!episodePlayBody.currentPlayerId.includes("google")) {
            $("#video-player").append("<video id='custom-player' class='video-js' style='width: 100%;height: 100%;'></video>");

            episodePlayBody.video = videojs('custom-player', {
                controls: true,
                autoplay: false
            }, function () {
                getVideoUrl(ServiceSupport.getServiceFunction().getPlayerUrlById(episodePlayBody.currentPlayerId), function (url, status, customPlayer) {
                    if (status === VideoDecoderErrorCodes.Sucess) {
                        episodePlayBody.video.src(url);
                    }
                });
            });
        } else {
            let playerUrl = ServiceSupport.getServiceFunction().getPlayerUrlById(episodePlayBody.currentPlayerId);
            $("#video-player").append("<iframe id='iframe-player' width='100%' height='100%' style='margin-bootom: 2%;width: 100%;height: 100%;' allowfullscreen='true' src='" + playerUrl + "' ></iframe>");
        }
    },
    view: function () {
        return m(".episodePlay", { "class": "col-md-12", "style": "margin-top: 1%; margin-bootom: 1%" },
            [
                //Next previous episodes
                m("div", { "class": "row" }, [
                    m("div", { "class": "col align-self-start" }, [
                        m("button", { "class": "btn btn-primary pull-left" }, "Previous episode")
                    ]),

                    m("div", { "class": "col align-self-center" }, [
                        m("select", { "id": "js-select-episode" }, [
                            ServiceSupport.getServiceFunction().episodeList.map(function (episode) {
                                return m("option", { "value": episode.id }, episode.title);
                            })
                        ])
                    ]),

                    m("div", { "class": "col align-self-end" }, [
                        m("button", { "class": "btn btn-primary pull-right" }, "Next episode")
                    ]),
                ]),

                //Players button
                m("div", { "class": "row", "style": "margin-top: 2%" }, [
                    m("div", { "class": "col wrapper text-center" }, [
                        m("div", { "class": "btn-group", "role": "group" }, [
                            ServiceSupport.getServiceFunction().currentEpisodePlaysers.map(function (player) {
                                return m("button", {
                                    "class": ["btn btn-secondary", player.selected === true ? "active" : ""].join(" "), "id": player.id,
                                    "onclick": function () {
                                        if (episodePlayBody.currentPlayerId != "") {
                                            episodePlayBody.clearPlayer();
                                        }
                                        episodePlayBody.currentPlayerId = player.id;
                                        episodePlayBody.initPlayer();
                                        /*                                        ServiceSupport.getServiceFunction().clearCurrentEpisodePlayer();
                                                                                ServiceSupport.getServiceFunction().setCurrentEpisodePlayer(player.id);
                                                                                console.log(ServiceSupport.getServiceFunction().currentEpisodePlayer);*/
                                    }
                                }, player.name);
                            })
                        ])
                    ])
                ]),


                //Player
                m("div", { "class": "row", "style": "margin-top: 2%;margin-bottom: 2%;" }, [
                    m("div", { "id": "video-player", "class": "col wrapper", "style": ["width: 100%;height: 65%;", this.currentPlayerId === "" ? "display: none;" : ""].join(" ") })
                ]),

            ]
        );
    }
};

this.EpisodePlay = {
    oninit: function (vnode) {
        console.log(vnode.attrs);
        if (!vnode.attrs.sid) {
            m.route.set("/");
        }

        if (!vnode.attrs.aid) {
            m.route.set("/");
        }

        if (!vnode.attrs.eid) {
            m.route.set("/");
        }

        if (!ServiceSupport.setCurrentService(vnode.attrs.sid)) {
            m.route.set("/");
        }

        if (!ServiceSupport.getServiceFunction().setCurrentAnime(vnode.attrs.aid)) {
            m.route.set("/");
        }

        if (!ServiceSupport.getServiceFunction().setCurrentEpisode(vnode.attrs.eid)) {
            m.route.set("/");
        }
    },
    oncreate: function () {
        $('#js-select-episode').select2();

        $('#js-select-episode').val(ServiceSupport.getServiceFunction().currentEpisodeId).trigger('change');
    },
    view: function () {
        return layout(m(episodePlayBreadcrumb), m(episodePlayHeader), m(episodePlayBody));
    }
}
