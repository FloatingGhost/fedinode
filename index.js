const auth = require("./auth")
const { post, likeStatus, boostStatus } = require("./post")
const { pollTimeline, switchTimeline } = require("./timeline")
const pollNotifications = require("./notifications")
const prompts = require("prompts")

const changeTimeline = async () => {
    const answer = await prompts({
        type: "select",
        name: "timeline",
        message: "timeline",
        choices: [
            { title: "home", value: "home" },
            { title: "public", value: "public" }
        ]
    }
    )
    switchTimeline(answer.timeline)

}

const mainLoop = async (instance, token) => {
    const answer = await prompts({
        type: "select",
        name: "action",
        message: "action",
        choices: [
            { title: "post", value: async () => await post(instance, token) },
            { title: "switch timeline", value: changeTimeline },
            { title: "like", value: async () => await likeStatus(instance, token) },
            { title: "boost" , value: async () => await boostStatus(instance, token) },
            { title: "quit", value: async () => { 
                console.log("byebye now")
                process.exit(1) 
            }}
        ]
    }
    )

    if (answer.action) {
        try {
            await answer.action()
        } catch (e) {
            console.error("failed, you probably cancelled")
        }
    } else {
        console.log("No action found...")
        throw "cancelled by user"
    }
}


auth.login().then(async ({ instance, token }) => {
    pollTimeline(instance, token)
    pollNotifications(instance, token)

    while (1) {
        try {
            await mainLoop(instance, token)
        } catch (e) {
            console.log(e)
            process.exit(1)
            break
        }
    }
})
