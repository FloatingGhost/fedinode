const fetch = require("node-fetch")
const applyProxy = require("./proxy")

const pollTimeline = async (instance, token) => {
    let minId
    while (true) {
        const queryString = (minId)?`?since_id=${minId}`:""
        const resp = await fetch(`https://${instance}/api/v1/timelines/home${queryString}`, applyProxy({
            headers: { "Authorization": token, "content-type": "application/json" }
        }))
        const out = await resp.json()
        out.reverse().forEach(status => {
            console.log(formatStatus(status) + "\n")
        })
        if (out.length != 0) {
            minId = out[out.length - 1].id
        }

        await sleep(5000)        
    }
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const formatStatus = ({ account: { acct }, content, pleroma }) => {
    if (pleroma.content && pleroma.content["text/plain"]) {
        return `${acct}: ${pleroma.content["text/plain"]}`
    } else {
        return `${acct}: ${content}`
    }
}

module.exports = pollTimeline
