// plugin entrypoint
function main() {
    logseq.useSettingsSchema([
        {
            key: 'cogServer',
            type: 'string',
            default: 'ws://localhost:18080',
            title: 'CogServer hostname',
            description: 'The endpoint of the CogServer you will use.'
        }
    ])
    const socket = openSocket(`${logseq.settings.cogServer}/json`)
}

// Open the socket
function openSocket(url) {
    try {
        socket = new WebSocket(url)
        socket.addEventListener('open', openConnection)
        socket.addEventListener('close', closeConnection)
        socket.addEventListener('message', readReply)
        socket.addEventListener('error', reportError)
    } catch (err) {
        logseq.UI.showMsg(err.toString())
    }
}

function openConnection() {
    logseq.UI.showMsg('Successfully opened a connection to the CogServer!')
}

function closeConnection() {
    logseq.UI.showMsg('Lost connection to the CogServer!')
}

// Display the reply message
function readReply(event) {
    logseq.UI.showMsg(event.data)
}

// bootstrap
logseq.ready(main).catch(console.error)
