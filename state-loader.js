const fs = require("fs")
const statePath = "./.state.secret"

const get = (param) => {
    if (!fs.existsSync(statePath)) return null

    const data = JSON.parse(fs.readFileSync(statePath))
    return data[param]
}

const set = (key, value) => {
    let data

    if (fs.existsSync(statePath)) {
        data = JSON.parse(fs.readFileSync(statePath))
    } else {
        data = {}
    }

    const newData = {...data, [key]: value}
    fs.writeFileSync(statePath, JSON.stringify(newData))
}

module.exports = { get, set }
