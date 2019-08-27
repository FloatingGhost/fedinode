const fetch = require("node-fetch")
const applyProxy = require("./proxy")
const colors = require("colors")

let timeline = "home"
let minId

const pollTimeline = async (instance, token) => {
    while (true) {
        const queryString = (minId)?`?since_id=${minId}`:""
        const resp = await fetch(`https://${instance}/api/v1/timelines/${timeline}${queryString}`, applyProxy({
            headers: { "Authorization": token, "content-type": "application/json" }
        }))
        const out = await resp.json()
        out.reverse().forEach(status => {
            console.log(formatStatus(status))
        })
        if (out.length != 0) {
            minId = out[out.length - 1].id
        }

        await sleep(5000)        
    }
}

const switchTimeline = (newTimeline) => {
    timeline = newTimeline
    minId = undefined
    console.log(`now browsing ${newTimeline}`)
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const formatStatus = ({ id, account: { acct }, content, pleroma }) => {
    if (pleroma.content && pleroma.content["text/plain"]) {
        return `\n${colors.green(acct)} (${id})\n${pleroma.content["text/plain"]}`
    } else {
        return `\n${colors.green(acct)} (${id})\n${content}`
    }
}

module.exports = { pollTimeline, switchTimeline }
