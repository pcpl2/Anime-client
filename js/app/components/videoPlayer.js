var VideoPlayer = {
    oncreate: function () {
        if (ServiceSupport.getServiceFunction().currentEpisodePlayer != "") {
            if (ServiceSupport.getServiceFunction().currentEpisodeCustomPlayer == false) {
                var video = videojs(document.querySelector('.video-js'), {
                    controls: true,
                    autoplay: false
                }, function() {
                    getVideoUrl(ServiceSupport.getServiceFunction().getPlayerUrlById(ServiceSupport.getServiceFunction().currentEpisodePlayer), function(url, status, customPlayer) {
                        if(status === VideoDecoderErrorCodes.Sucess) {
                            video.src(url);
                        }
                    });
                });
            }
        }
    },
    view: function () {
        return m("video", { "id": "custom-player", "class": "video-js", "style": "width: 100%;height: 100%;" });
    },
    onremove: function(vnode) {
        videojs('custom-player').dispose();
    },
}
