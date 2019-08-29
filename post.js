const fetch = require("node-fetch")
const prompts = require("prompts")
const applyProxy = require("./proxy")
const FormData = require("form-data")
const colors = require("colors")
const state = require("./state-loader")
const fs = require("fs")

const likeStatus = async (instance, token) => {
    const { id } = await prompts(
        {
            type: "text",
            name: "id",
            message: "id to like"
        })

    const resp = await fetch(`https://${instance}/api/v1/statuses/${id}/favourite`, applyProxy({
        headers: { "Authorization": token },
        method: "POST"
    }))

    if (resp.status == 200) {
        console.log(colors.green(`---\nliked ${id}\n---`))
    } else {
        console.log(colors.red(`could not like ${id}, status ${resp.status}`))
    }
}


const boostStatus = async (instance, token) => {
    const { id } = await prompts(
        {
            type: "text",
            name: "id",
            message: "id to boost"
        })

    const resp = await fetch(`https://${instance}/api/v1/statuses/${id}/reblog`, applyProxy({
        headers: { "Authorization": token },
        method: "POST"
    }))

    if (resp.status == 200) {
        console.log(colors.green(`---\nboosted ${id}\n---`))
    } else {
        console.log(colors.red(`could not like ${id}, status ${resp.status}`))
    }
}

const post = async (instance, token) => {
    const choices = await prompts([
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
            name: "status",
            message: "status (\\n for a line break)",
            validate: value => value.length == 0 ? "Can't post an empty status":true,
            multiline: true
        },
        { 
            type: "toggle",
            message: "add image(s)?",
            name: "addImages",
            active: "yes",
            initial: false,
            inactive: "no"
        },
        {
            type: prev => prev == true ? "list":null,
            name: "imagePaths",
            message: "image paths, relative or absolute (sep ,)",
            separator: ","
        },
        {
            type: prev => prev.length > 0 ? "toggle":null,
            message: "mark sensitive?",
            name: "sensitive",
            active: "yes",
            initial: false,
            inactive: "no"
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
    return await createStatus(instance, token, choices)
}

const uploadMedia = async (instance, token, path) => {
    colors.yellow(`Uploading ${path}...`)
    if (!fs.existsSync(path)) {
        throw `file ${path} does not exist`
    }

    const formData = new FormData()
    const f = fs.createReadStream(path)
    formData.append("file", f)

    const result = await fetch(`https://${instance}/api/v1/media`, applyProxy({
        headers: { "Authorization": token },
        method: "POST",
        body: formData
    }))
    const { id } = await result.json()
    return id
}

const getStatus = async (instance, token, id) => {
    return await fetch(`https://${instance}/api/v1/statuses/${id}`, applyProxy({
        headers: {"Authorization": token}
    }))
}

const createStatus = async (instance, token, { status, visibility, in_reply_to, addImages, imagePaths, sensitive }) => {
    let form = new FormData()
    let additionalMentions = ""

    if (in_reply_to) {
        form.append("in_reply_to_id", in_reply_to)
        const replied_to_tweet = await getStatus(instance, token, in_reply_to)
        if (replied_to_tweet.status != 200) {
            console.log(replied_to_tweet.status)
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

    if (addImages) {
        const ids = await Promise.all(imagePaths.map(async (path) => {
            return await uploadMedia(instance, token, path)
        }))
        form.append("media_ids[]", ids.toString())
        form.append("sensitive", sensitive.toString())
    }


    form.append("status", (additionalMentions + " " + status.replace(/\\n/g, "\n")).trim())
    form.append("visibility", visibility)

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


module.exports = { post, likeStatus, boostStatus, getStatus }
