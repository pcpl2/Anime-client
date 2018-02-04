this.gamedorUsermdNet = {
    domain: "gamedor.usermd.net",

    headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36'
    },

    register: function () {
        return VideoServiceSupport.serviceWithHiddenLinks.push({ api: gamedorUsermdNet, id: "usermd", domain: this.domain });
    },


    getServiceLink: function (dataObj, returnFunction) {
        var self = this;

        //check domain
        if (getDomainName(dataObj.url) != this.domain) {
            returnFunction("");
            return;
        }

        const headers = {
            'Accept': self.headers.Accept,
            'Referer': dataObj.referer,
            'User-Agent': self.headers['User-Agent']
        }

        request({ url: dataObj.url, headers: headers }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const listHtml = $(parseHtml(body)).find("iframe");
                var validEncodedData = undefined;
                returnFunction(listHtml[0].src);
            } else {
                returnFunction("");
            }
        });
    }

}

