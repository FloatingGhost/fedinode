const auth = require("./auth")
const { post } = require("./post")
const { pollTimeline, switchTimeline } = require("./timeline")
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
            { title: "switch timeline", value: changeTimeline }
        ]
    }
    )

    await answer.action()
}


auth.login().then(async ({ instance, token }) => {
    pollTimeline(instance, token)

    while (1) {
        await mainLoop(instance, token)
    }
})
