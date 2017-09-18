var VideoPlayer = {
    oncreate: function () {
        if (ServiceSupport.getServiceFunction().currentEpisodePlayer != "") {
            if (ServiceSupport.getServiceFunction().currentEpisodeCustomPlayer == true) {
                var video = videojs(document.querySelector('.video-js'), {
                    controls: true,
                    autoplay: false,
                    preload: 'auto'
                });
                video.src(ServiceSupport.getServiceFunction().currentEpisodePlayerUrl);

                video.ready(function () {
                    // example 0.11 aka 11%
                    var howMuchIsDownloaded = video.bufferedPercent();

                    console.log(howMuchIsDownloaded);
                });
            }
        }
    },
    view: function () {
        return m("video", { "id": "custom-player", "class": "video-js", "style": "width: 100%;height: 100%;" });
    },
}
