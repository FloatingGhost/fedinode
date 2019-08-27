const fetch = require("node-fetch")
const prompts = require("prompts")
const applyProxy = require("./proxy")
const FormData = require("form-data")

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
    console.log(`---\nliked ${id}\n---`)
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
    console.log(`---\nboosted ${id}\n---`)
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
            ]
        }
    ])
    return await createStatus(instance, token, body, visibility, in_reply_to)
}

const createStatus = async (instance, token, status, visibility, in_reply_to) => {
    let form = new FormData()
    form.append("status", status)
    form.append("visibility", visibility)
    form.append("sensitive", "false")

    if (in_reply_to) {
        form.append("in_reply_to_id", in_reply_to)
    }

    const resp  = await fetch(`https://${instance}/api/v1/statuses`, applyProxy({
        headers: {"Authorization": token},
        method: "POST",
        body: form
    })
    )
    const out = await resp.json()
    return out
}


module.exports = { post, likeStatus, boostStatus }
