class VkCom extends videoSupportImpl {
  constructor() {
    super(['vk.com', 'new.vk.com'], {})
    const self = this

    return { api: self, id: 'vk' }
  }

  getVideoUrl(url, returnFunction) {
    const self = this
    if (!self.checkUrlValid(url, returnFunction)) {
      return 0
    }

    const checkUrl0 = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(?:vk)\.[a-z]{2,3}\/(?:video_ext\.php\?)(?:[^/?]+)/;
    const checkUrl1 = /(?:https?:\/\/)?(?:(?:www|touch)\.)?(?:vk)\.[a-z]{2,3}\/(?:video)(?:[^/?]+)/;

    const getIdsAndHash0 = /video_ext\.php\?oid=(.*)\&id=(.*)\&hash=(.*)/;

    if (checkUrl0.test(url)) {
      const parsedDomain = getIdsAndHash0.exec(url);

      const oid = parsedDomain[1];
      const id = parsedDomain[2];
      const hash = parsedDomain[3];

      const requestUrl = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + id + "&hash=" + hash;
      self.getVideoLinks(requestUrl, returnFunction);
    } else if (checkUrl1.test(url)) {
      self.getIdsFromType1(url, (sucess, objectData) => {
        if (sucess) {
          const oid = objectData.oid;
          const id = objectData.id;
          const hash = objectData.hash;

          const requestUrl = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + id + "&hash=" + hash;
          self.getVideoLinks(requestUrl, returnFunction);
        } else {
          returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }
      });
    } else {
      returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
    }
  }

  getIdsFromType1(url, ret) {
    const getIdsAndHash1 = /video\?act\=get_swf\&oid=(.*)\&vid=(.*)\&embed_hash=(.*)/;
    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const listHtml = $(parseHtml(body)).find("meta");

        const metaValid = _.find(listHtml, (metaValue) => {
          if (metaValue.attributes.property != undefined) {
            return metaValue.attributes.property.nodeValue === "og:video";
          } else {
            return false;
          }
        })
        const fullUrl = metaValid.attributes.content.nodeValue;

        const parsedDomain = getIdsAndHash1.exec(fullUrl);
        ret(true, { oid: parsedDomain[1], id: parsedDomain[2], hash: parsedDomain[3] })
      } else {
        console.error(error)
        ret(false);
      }
    });
  }

  getVideoLinks(url, returnFunction) {
    const getConfig = /playerParams = (.+)\;/
    const getQualityData = /\.([0-9]{3,4})\.mp4/;

    request({ url: url, headers: app.defaultHeaders }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const scriptList = $(parseHtml(body)).find("script");
        var validEncodedData

        _.each(scriptList, (item, index) => {
          if (item.innerHTML.trim().replace(/\s/g, '').search('if') !== -1) {
            validEncodedData = item.innerHTML.trim()
          }
        })

        if (validEncodedData === undefined) {
          returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
          return 0;
        }

        const configJson = getConfig.exec(validEncodedData)[1]
        const config = JSON.parse(configJson)

        var videoObjs = [];

        if (config.params[0].url240 != undefined) {
          videoObjs.push({ url: config.params[0].url240, qualityLabel: "240p" })
        }
        if (config.params[0].url360 != undefined) {
          videoObjs.push({ url: config.params[0].url360, qualityLabel: "360p" })
        }
        if (config.params[0].url480 != undefined) {
          videoObjs.push({ url: config.params[0].url480, qualityLabel: "480p" })
        }
        if (config.params[0].url720 != undefined) {
          videoObjs.push({ url: config.params[0].url720, qualityLabel: "720p" })
        }

        const poster = config.params[0].jpg

        if (videoObjs.length === 0) {
          returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
          return 0
        }

        const vidObj = videoObjs.pop()

        if (new RegExp(ValidateVideoUrlRegex).test(vidObj.url)) {
          returnFunction(vidObj.url, VideoDecoderErrorCodes.Sucess, true);
        } else {
          returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
        }
      } else {
        console.error(error)
        returnFunction("", VideoDecoderErrorCodes.VIDEO_NOT_FOUND);
      }
    });
  }
}
