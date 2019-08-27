const HttpsProxyAgent = require("https-proxy-agent")

const applyProxy = (fetchOpts) => {
    if (process.env.HTTP_PROXY) {
        return {
            ...fetchOpts,
            agent: new HttpsProxyAgent(process.env.HTTP_PROXY)
        }
    }
    return fetchOpts
}

module.exports = applyProxy
