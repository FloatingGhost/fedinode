const auth = require("./auth")
const { post } = require("./post")
const pollTimeline = require("./timeline")

auth.login().then(async ({ instance, token }) => {
    pollTimeline(instance, token)

    while (1) {
        const { content } = await post(instance, token)    
    }
})
