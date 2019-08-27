const fetch = require("node-fetch")
const prompts = require("prompts")
const applyProxy = require("./proxy")
const FormData = require("form-data")
const colors = require("colors")
const state = require("./state-loader")

const likeStatus = async (instance, token) => {
    const { id } = await prompts(
        {
            type: "text",
            name: "id",
            message: "id to like"
        })

    await fetch(`https://${instance}/api/v1/statuses/${id}/favourite`, applyProxy({
        headers: { "Authorization": token },
        method: "POST"
    }))
    console.log(colors.green(`---\nliked ${id}\n---`))
}

const boostStatus = async (instance, token) => {
    const { id } = await prompts(
        {
            type: "text",
            name: "id",
            message: "id to boost"
        })

    await fetch(`https://${instance}/api/v1/statuses/${id}/reblog`, applyProxy({
        headers: { "Authorization": token },
        method: "POST"
    }))
    console.log(colors.green(`---\nboosted ${id}\n---`))
}

const post = async (instance, token) => {
    const { body, visibility, in_reply_to } = await prompts([
        {
            type: "select",
            name: "reply",
            message: "post type",
            choices: [
                { title: "status", value: "status" },
                { title: "reply", value: "reply" }
            ]
        },
        { 
            type: prev => prev == "reply" ? "text":null,
            name: "in_reply_to",
            message: "id to reply to"
        },
        {
            type: "text",
            name: "body",
            message: "status",
            validate: value => value.length == 0 ? "Can't post an empty status":true
        },
        {
            type: "select",
            name: "visibility",
            message: "visibility",
            choices: [
                { title: "public", value: "public" },
                { title: "unlisted", value: "unlisted" },
                { title: "private", value: "private" },
                { title: "direct", value: "direct" }
            ]
        }
    ])
    return await createStatus(instance, token, body, visibility, in_reply_to)
}

const createStatus = async (instance, token, status, visibility, in_reply_to) => {
    let form = new FormData()
    let additionalMentions = ""

    if (in_reply_to) {
        form.append("in_reply_to_id", in_reply_to)
        const replied_to_tweet = await fetch(`https://${instance}/api/v1/statuses/${in_reply_to}`, applyProxy({
            headers: {"Authorization": token}
        }))
        if (replied_to_tweet.status != 200) {
            console.log(colors.red(`could not reply to ${in_reply_to}, couldn't fetch it`))
            return
        }

        const replied_to_json = await replied_to_tweet.json()
        const { mentions } = replied_to_json
        const iam = state.get("username")
        additionalMentions = (mentions || [])
            .concat([replied_to_json.account])
            .filter(mention => mention.username != iam)
            .map(x => `@${x.acct}`)
            .join(" ")
    }


    form.append("status", (additionalMentions + " " + status).trim())
    form.append("visibility", visibility)
    form.append("sensitive", "false")

    const resp  = await fetch(`https://${instance}/api/v1/statuses`, applyProxy({
        headers: {"Authorization": token},
        method: "POST",
        body: form
    })
    )
    console.debug(`Status: ${resp.status}`)
    const out = await resp.json()

    return out
}


module.exports = { post, likeStatus, boostStatus }
