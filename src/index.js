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
    const socket = openSocket(`${logseq.settings.cogServer}/scm`)
    logseq.App.registerUIItem('toolbar', {
        key: 'opencog',
        template: `<button title="OpenCog" class="button icon inline"><span class="ui__icon ti ls-icon-settings "><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      </svg></span></button>`
    })
    // logseq.provideUI({
    //     key: 'open-calendar',
    //     path: '#search',
    //     template: `
    //      <a data-on-click="openCalendar" onclick="alert('abc')' style="opacity: .6; display: inline-flex; padding-left: 3px;'>
    //        <i class="iconfont icon-Calendaralt2"></i>
    //      </a>
    //     `
    // })
}

// Open the socket
function openSocket(url) {
    try {
        socket = new WebSocket(url)
        socket.addEventListener('open', openConnection)
        socket.addEventListener('close', closeConnection)
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
    sendMessage(socket)
}

// closed websocket callback
function closeConnection() {
    logseq.UI.showMsg('Lost connection to the CogServer!', 'warning')
}

// read the websocket reply
function readReply(event) {
    logseq.UI.showMsg(event.data)
}

// send websocket message
function sendMessage(socket, message = '(display "Hello, World!\n")') {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message)
    } else {
        logseq.UI.showMsg('Socket not ready!')
    }
}

// bootstrap
logseq.ready(main).catch(console.error)
