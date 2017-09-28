var VideoPlayer = {
    oncreate: function () {
        if (ServiceSupport.getServiceFunction().currentEpisodePlayer != "") {
            if (ServiceSupport.getServiceFunction().currentEpisodeCustomPlayer == true) {
                console.log(ServiceSupport.getServiceFunction().currentEpisodePlayerUrl);
                var video = videojs(document.querySelector('.video-js'), {
                    controls: true,
                    autoplay: false,
                    preload: 'auto'
                });
                video.src(ServiceSupport.getServiceFunction().currentEpisodePlayerUrl);
            }
        }
    },
    view: function () {
        return m("video", { "id": "custom-player", "class": "video-js", "style": "width: 100%;height: 100%;" });
    },
    onremove: function(vnode) {
    },
}
