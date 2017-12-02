const m = require("mithril");

const AutoUpdater = require("nw-autoupdater"),
    updater = new AutoUpdater(require("./package.json"), {
        strategy: "ScriptSwap"
    });

m.route(document.getElementById("application"), "", {
    "/service/:sid/list": AnimeList,
    "/service/:sid/anime/:aid/list": EpisodeList,
    "/service/:sid/anime/:aid/episode/:eid": EpisodePlay,
    "": SelectService
});

async function update() {
    try {
        const rManifest = await updater.readRemoteManifest();
        const needsUpdate = await updater.checkNewVersion(rManifest);

        if (!needsUpdate) {
            return;
        }
        if (!confirm("New release is available. Do you want to upgrade?")) {
            return;
        }

        updater.on("download", (downloadSize, totalSize) => {
            console.log("download progress", Math.floor(downloadSize / totalSize * 100), "%");
        });
        updater.on("install", (installFiles, totalFiles) => {
            console.log("install progress", Math.floor(installFiles / totalFiles * 100), "%");
        });
        const updateFile = await updater.download(rManifest);
        await updater.unpack(updateFile);
        alert(`The application will automatically restart to finish installing the update`);
        await updater.restartToSwap();
    } catch (e) {
        console.error(e);
    }
}

update();
