const fetch = require("node-fetch")
const applyProxy = require("./proxy")
const colors = require("colors/safe")
const { sleep } = require("./utils")

const pollNotifications = async (instance, token) => {
    let minId
    while (true) {
        let queryString = (minId)?`?since_id=${minId}`:""

        const resp = await fetch(`https://${instance}/api/v1/notifications${queryString}`, applyProxy({
            headers: { "Authorization": token, "content-type": "application/json" }
        }))
        const out = await resp.json()
        out.reverse().forEach(status => {
            console.log(formatNotification(status) + "\n")
        })
        if (out.length != 0) {
            minId = out[out.length - 1].id
        }

        await sleep(5000)
    }
}

const formatNotification = ({ type, account }) => {
    switch (type) {
        case "favourite":
            return colors.green(`${account.display_name} favourited your status`)
        case "reblog":
            return colors.yellow(`${account.display_name} boosted your status`)
        case "follow":
            return colors.purple(`${account.display_name} followed you`)
        case "mention":
            return colors.blue(`${account.display_name} mentioned you`)
    }
}


module.exports = pollNotifications
