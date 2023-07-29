let socket

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
    openSocket(`${logseq.settings.cogServer}/scm`)
    // logseq.App.registerUIItem('toolbar', {
    //     key: 'opencog',
    //     template: `<button title="OpenCog" class="button icon inline"><span class="ui__icon ti ls-icon-settings "><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    //     <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    //     <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
    //     <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    //   </svg></span></button>`
    // })
}

// Open the socket
function openSocket(url) {
    try {
        socket = new WebSocket(url)
        socket.addEventListener('open', openConnection)
        socket.addEventListener('close', retryConnection)
        socket.addEventListener('message', readReply)
        socket.addEventListener('error', readReply)
        return socket
    } catch (err) {
        console.error(err)
        logseq.UI.showMsg(err.toString())
    }
}

// opened websocket callback
function openConnection() {
    logseq.UI.showMsg(
        'Successfully opened a connection to the CogServer!',
        'success'
    )
    handleTransactions()
}

// closed websocket callback
async function retryConnection() {
    logseq.UI.showMsg(
        'Cannot connect to the CogServer! Trying again...',
        'warning'
    )
    await delay(5000)
    openSocket(`${logseq.settings.cogServer}/scm`)
}

// read the websocket reply
function readReply(event) {
    logseq.UI.showMsg(event.data)
    console.log(event.data)
}

// send websocket message
function sendMessage(message = `(cog-get-atoms 'Atom #t)`) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message)
    } else {
        logseq.UI.showMsg('Socket not ready!')
    }
}

// delay execution
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// handle database transaction events
function handleTransactions() {
    logseq.DB.onChanged((e) => {
        console.log(e)
        if (e.txMeta.skipRefresh) return
        if (
            e.txMeta.outlinerOp === 'saveBlock' ||
            e.txMeta.outlinerOp === 'insertBlocks'
        ) {
            if (e.blocks[0].content) {
                for (const data of e.txData) {
                    if (data[1] !== 'content') continue
                    if (!data[4]) {
                        // Deprecated previous atoms
                        sendMessage(
                            `(cog-set-atom-attribute! "${data[2]}" 'deprecated #t))`
                        )
                    } else if (data[4]) {
                        // Create new atoms
                        sendMessage(`(Concept "${data[2]}")`)
                    }
                }
            }
        }
    })
}

// bootstrap
logseq.ready(main).catch(console.error)
