var episodePlayBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService.id + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().currentServiceData.name),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService.id + "/anime/" + ServiceSupport.getServiceFunction().currentAnime.id + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().currentAnime.title),
            m("span", { "class": "breadcrumb-item active" }, ServiceSupport.getServiceFunction().currentEpisodeTitle)
        ]
    }
};

var episodePlayHeader = {
    view: function () {
        return m("label", { "class": "col-form-label col-md-12" }, ServiceSupport.getServiceFunction().currentEpisodeTitle);
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
                VideoServiceSupport.getVideoUrl(ServiceSupport.getServiceFunction().getPlayerUrlById(episodePlayBody.currentPlayerId), function (url, status, customPlayer) {
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
                        m("button", {
                            "class": ["btn btn-primary pull-left", parseInt(ServiceSupport.getServiceFunction().currentEpisodeId) > 1 ? "" : "disabled"].join(" "), "onclick": function () {
                                let epId = parseInt(ServiceSupport.getServiceFunction().currentEpisodeId) - 1;
                                episodePlayBody.clearPlayer();
                                ServiceSupport.getServiceFunction().setCurrentEpisode(epId);
                                $('#js-select-episode').val(ServiceSupport.getServiceFunction().currentEpisodeId).trigger('change');
                            }
                        }, "Previous episode")
                    ]),

                    m("div", { "class": "col align-self-center" }, [
                        m("select", { "id": "js-select-episode" }, [
                            ServiceSupport.getServiceFunction().episodeList.map(function (episode) {
                                return m("option", { "value": episode.id }, episode.title);
                            })
                        ])
                    ]),

                    m("div", { "class": "col align-self-end" }, [
                        m("button", {
                            "class": ["btn btn-primary pull-right", parseInt(ServiceSupport.getServiceFunction().currentEpisodeId) < ServiceSupport.getServiceFunction().episodeList.length ? "" : "disabled"].join(" "), "onclick": function () {
                                let epId = parseInt(ServiceSupport.getServiceFunction().currentEpisodeId) + 1;
                                episodePlayBody.clearPlayer();
                                ServiceSupport.getServiceFunction().setCurrentEpisode(epId);
                                $('#js-select-episode').val(ServiceSupport.getServiceFunction().currentEpisodeId).trigger('change');
                            }
                        }, "Next episode")
                    ]),
                ]),

                //Players button
                m("div", { "class": "row", "style": "margin-top: 2%" }, [
                    m("div", { "class": "col wrapper text-center" }, [
                        m("div", { "class": "col-md-12" }, [
                            ServiceSupport.getServiceFunction().currentEpisodePlaysers.map(function (player) {
                                return m("button", {
                                    "class": ["btn btn-secondary col-md-3", episodePlayBody.currentPlayerId === player.id ? "active" : ""].join(" "), "id": player.id,
                                    "onclick": function () {
                                        if (episodePlayBody.currentPlayerId != "") {
                                            episodePlayBody.clearPlayer();
                                        }
                                        episodePlayBody.currentPlayerId = player.id;
                                        episodePlayBody.initPlayer();
                                    }
                                }, [
                                        m("span", {class: "lang-sm", "lang": player.lang.toLowerCase()}),
                                        " ",
                                        player.name,
                                        /*player.desc != "-" ?*/ [m("br"), player.desc] /*: ""*/,
                                        m("br"),
                                        VideoServiceSupport.checkSupportPlayerById(player.id) ?
                                            m("span", { "class": "badge badge-success" }, "Supported")
                                            :
                                            m("span", { "class": "badge badge-danger" }, "Not supported")
                                    ]);
                            })
                        ])
                    ])
                ]),

                //Player
                m("div", { "class": "row", "style": "margin-top: 2%;margin-bottom: 2%;" }, [
                    m("div", { "id": "video-player", "class": "col wrapper", "style": ["width: 100%;height: 65%;", episodePlayBody.currentPlayerId === "" ? "display: none;" : ""].join(" ") })
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

        $('#js-select-episode').on("select2:select", function (event) {
            let value = $(event.currentTarget).find("option:selected").val();
            let epId = parseInt(value, 10);
            console.log(epId);
            episodePlayBody.clearPlayer();
            ServiceSupport.getServiceFunction().setCurrentEpisode(epId);
        });

    },
    view: function () {
        return layout(m(episodePlayBreadcrumb), m(episodePlayHeader), m(episodePlayBody));
    }
}
