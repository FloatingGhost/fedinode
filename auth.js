const fs = require("fs")
const prompts = require("prompts")
const fetch = require("node-fetch")
const URLSearchParams = require("url-search-params")
const applyProxy = require("./proxy")

const credentialsPath = "./.token.secret"

const registerOauth = async (instance) => {
    console.debug("registering oauth application...")
    const params = new URLSearchParams()
    params.set("client_name", `fedinode ${Math.random()}`)
    params.set("redirect_uris", "urn:ietf:wg:oauth:2.0:oob")
    params.set("scopes", "read write follow")

    const resp = await fetch(`https://${instance}/api/v1/apps`, applyProxy({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    }))

    const out = await resp.json()
    return out
}

const loginUser = async (instance, clientId, clientSecret, username, password) => {
    const params = new URLSearchParams()
    params.set("client_id", clientId)
    params.set("client_secret", clientSecret)
    params.set("username", username)
    params.set("password", password)
    params.set("grant_type", "password")
    params.set("scope", "read write follow")

    const resp = await fetch(`https://${instance}/oauth/token`, applyProxy({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    }))
    const out = await resp.json()
    return out
}

const login = async () => {
    if (fs.existsSync(credentialsPath)) {
        return JSON.parse(fs.readFileSync(credentialsPath))
    }

    const questions = [
        {
            type: "text",
            name: "instance",
            message: "instance url, (not including https://)"
        },
        {
            type: "text",
            name: "username",
            message: "username"
        },
        {
            type: "password",
            name: "password",
            message: "password"
        }
    ]

    const { instance, username, password } = await prompts(questions)
    const { client_id, client_secret } = await registerOauth(instance)
    const resp = await loginUser(instance, client_id, client_secret, username, password)
    const token = `${resp.token_type} ${resp.access_token}`
    fs.writeFileSync(credentialsPath, JSON.stringify({ instance, token }))
    return { instance, token }
}

module.exports = { login }
