require("select2");
const videojs = require("video.js");
require("videojs-resolution-switcher");

var episodePlayBreadcrumb = {
    view: function () {
        return [
            m("a", { "class": "breadcrumb-item", href: "/", oncreate: m.route.link }, "SelectService"),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService.id + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().serviceData.name),
            m("a", { "class": "breadcrumb-item", href: "/service/" + ServiceSupport.currentService.id + "/anime/" + ServiceSupport.getServiceFunction().selectedAnime.id + "/list", oncreate: m.route.link }, ServiceSupport.getServiceFunction().selectedAnime.title),
            m("span", { "class": "breadcrumb-item active" }, ServiceSupport.getServiceFunction().selectedEpisode.title)
        ]
    }
};

var episodePlayHeader = {
    view: function () {
        return m("label", { "class": "col-form-label col-md-12" }, ServiceSupport.getServiceFunction().selectedEpisode.title);
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
        $("#player-error").remove();
    },
    initPlayer() {
        var self = this;
        $("#player-error").remove();
        $("#video-player").append("<div id='player-loader'> <div class='loader' style='margin: auto; position: relative; margin-top:10%;'></div></div>");
        if (!episodePlayBody.currentPlayerId.includes("google")) {
            VideoServiceSupport.getVideoUrl(ServiceSupport.getServiceFunction().getServiceUrlObjById(episodePlayBody.currentPlayerId), function (url, status, customPlayer) {
                $("#player-loader").remove();
                $("#video-player").append("<video id='custom-player' class='video-js vjs-big-play-centered' style='width: 100%;height: 100%;'></video>");

                let player = $("#custom-player");

                if (status === VideoDecoderErrorCodes.Sucess) {
                    self.video = videojs(player[0], {
                        controls: true,
                        autoplay: false,
                        preload: "auto",
                        plugins: {
                            videoJsResolutionSwitcher: {
                                default: 'high',
                                dynamicLabel: true
                            }
                        }
                    }, function () {
                        self.video.updateSrc([
                            { type: "video/mp4", src: url, label: 'default' }
                        ])
                        self.video.on('resolutionchange', function () {
                            console.info('Source changed to %s', player.src())
                        })
                    });


                } else {
                    self.clearPlayer();
                    self.showPlayerError();
                }
            });
        } else {
            $("#player-loader").remove();
            let serviceObj = ServiceSupport.getServiceFunction().getServiceUrlObjById(episodePlayBody.currentPlayerId);
            $("#video-player").append("<iframe id='iframe-player' width='100%' height='100%' style='margin-bootom: 2%;width: 100%;height: 100%;' allowfullscreen='true' src='" + serviceObj.url + "' ></iframe>");
        }
    },
    showPlayerError() {
        $("#video-player").append("<div id='player-error' class='alert alert-danger' role='alert'>" +
            "<h4 class='alert-heading'>Load video error</h4>" +
            "<p>An error occurred while loading the video or no longer exists on the selected host. Please choose another host.</p>" +
            "</div>");
    },
    view: function () {
        return m(".episodePlay", { "class": "col-md-12", "style": "margin-top: 1%; margin-bootom: 1%" },
            [
                //Next previous episodes
                m("div", { "class": "row" }, [
                    m("div", { "class": "col align-self-start" }, [
                        m("button", {
                            "class": ["btn btn-raised btn-info pull-left", parseInt((ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() + 1)) > 1 ? "" : "disabled"].join(" "), "onclick": function () {
                                if (parseInt((ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() + 1)) > 1) {
                                    let epId = ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() - 1;
                                    episodePlayBody.clearPlayer();
                                    ServiceSupport.getServiceFunction().setCurrentEpisode(ServiceSupport.getServiceFunction().episodeList[epId].id);
                                    $('#js-select-episode').val(ServiceSupport.getServiceFunction().selectedEpisode.id).trigger('change');
                                }
                            }
                        }, "Previous episode")
                    ]),

                    m("div", { "class": "col align-self-center" }, [
                        m("select", { "id": "js-select-episode", style: "width: 100%" }, [
                            ServiceSupport.getServiceFunction().episodeList.map(function (episode) {
                                return m("option", { "value": episode.id }, episode.title);
                            })
                        ])
                    ]),

                    m("div", { "class": "col align-self-end" }, [
                        m("button", {
                            "class": ["btn btn-raised btn-info pull-right", parseInt((ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() + 1)) < ServiceSupport.getServiceFunction().episodeList.length ? "" : "disabled"].join(" "), "onclick": function () {
                                if (parseInt((ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() + 1)) < ServiceSupport.getServiceFunction().episodeList.length) {
                                    let epId = ServiceSupport.getServiceFunction().getCurrentEpisodeIndex() + 1;
                                    episodePlayBody.clearPlayer();
                                    ServiceSupport.getServiceFunction().setCurrentEpisode(ServiceSupport.getServiceFunction().episodeList[epId].id);
                                    $('#js-select-episode').val(ServiceSupport.getServiceFunction().selectedEpisode.id).trigger('change');
                                }
                            }
                        }, "Next episode")
                    ]),
                ]),

                //Players button
                m("div", { "class": "row", "style": "margin-top: 2%" }, [
                    m("div", { "class": "col wrapper text-center" }, [
                        m("div", { "class": "col-md-12" }, [
                            ServiceSupport.getServiceFunction().selectedEpisode.players.map(function (player) {
                                return m("button", {
                                    "class": ["btn btn-raised btn-info col-md-3", episodePlayBody.currentPlayerId === player.id ? "active" : ""].join(" "), "id": player.id,
                                    "onclick": function () {
                                        if (episodePlayBody.currentPlayerId != "") {
                                            episodePlayBody.clearPlayer();
                                        }
                                        episodePlayBody.currentPlayerId = player.id;
                                        episodePlayBody.initPlayer();
                                    }
                                }, [
                                        m("span", { class: "lang-sm", "lang": player.lang.toLowerCase() }),
                                        " ",
                                        player.name,
                                        /*player.desc != "-" ?*/[m("br"), player.desc] /*: ""*/,
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
                    m("div", { "id": "video-player", "class": "col wrapper", "style": "width: 100%;height: 65%;"/*["width: 100%;height: 65%;", episodePlayBody.currentPlayerId === "" ? "display: none;" : ""].join(" ")*/ })
                ]),

            ]
        );
    }
};

this.EpisodePlay = {
    oninit: function (vnode) {
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

        $('#js-select-episode').val(ServiceSupport.getServiceFunction().selectedEpisode.id).trigger('change');

        $('#js-select-episode').on("select2:select", function (event) {
            let epId = $(event.currentTarget).find("option:selected").val();
            console.log(epId);
            episodePlayBody.clearPlayer();
            ServiceSupport.getServiceFunction().setCurrentEpisode(epId);
        });

    },
    view: function () {
        return layout(m(episodePlayBreadcrumb), m(episodePlayHeader), m(episodePlayBody));
    },
    onbeforeremove: function (vnode) {
        ServiceSupport.getServiceFunction().clearCurrentEpisode();
    },
}
