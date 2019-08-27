const fetch = require("node-fetch")
const prompts = require("prompts")
const applyProxy = require("./proxy")
const FormData = require("form-data")

const post = async (instance, token) => {
    const { body, visibility } = await prompts([{
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
    return await createStatus(instance, token, body, visibility)
}

const createStatus = async (instance, token, status, visibility) => {
    let form = new FormData()
    form.append("status", status)
    form.append("visibility", visibility)
    form.append("sensitive", "false")
    const resp  = await fetch(`https://${instance}/api/v1/statuses`, applyProxy({
        headers: {"Authorization": token},
        method: "POST",
        body: form
    })
    )
    const out = await resp.json()
    return out
}


module.exports = { post }
