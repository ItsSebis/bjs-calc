const fs = require('fs'); // files

const express = require('express')
const backend = express()
const mobileBackend = express()
const port = 1871
const mobilePort = 1872
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(backend)
const mobileServer = http.createServer(mobileBackend)
const io = new Server(server, {pingInterval: 1500, pingTimeout: 5000})
const mo = new Server(mobileServer, {pingInterval: 1500, pingTimeout: 5000})

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

backend.use(express.static("./public"))
backend.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});
mobileBackend.use(express.static("./mobile"))
mobileBackend.get('/', (req, res) => {
    res.sendFile(__dirname + '/mobile/index.html')
});

// init vars
let passwords = {
    calc: "",
    mobile: ""
}
let lists = {}
let calcSock = {}
let sockets = {}
let socketGroups = {}

fs.readFile('./data.json', 'utf8', (err, data) => {
    if (!err) {
        lists = JSON.parse(data)
        console.log("Restored lists")
    }
})
fs.readFile('./pass.json', 'utf8', (err, data) => {
    if (!err) {
        passwords = JSON.parse(data)
        console.log("Restored lists")
    }
})

// code
io.on('connection', (socket) => {
    // client connected
    //console.log("Client connected: " + socket.id)
    // get group data if any
    calcSock[socket.id] = false
    socket.on('edit', (socketGroup) => {
        //console.log(socket.id + " requests group " + socketGroup)
        if (lists[socketGroup] !== undefined) {
            socket.emit('setList', lists[socketGroup])
        } else {
            socket.emit('setList', {group: socketGroup})
        }
    })

    // save local changes
    socket.on('commit', (socketList) => {
        if (Object.keys(socketList).length > 1) {
            lists[socketList.group] = socketList
        } else if (lists[socketList.group] !== undefined) {
            delete lists[socketList.group]
        }
        exportToFile()
        const listOfLists = {}
        for (const list in lists) {
            listOfLists[list] = Object.keys(lists[list]).length-1
        }
        io.emit('lists', listOfLists)
        //console.log(socket.id + "'s list saved")
    })
})
mo.on('connection', (socket) => {
    // mobile client connected
    //console.log("Mobile client connected: " + socket.id)
    sockets[socket.id] = null
    // client select group
    socket.on('selectGroup', (group) => {
        //console.log(socket.id + " requests group " + group)
        if (sockets[socket.id] !== null) {
            delete socketGroups[sockets[socket.id]]
            sockets[socket.id] = null
        }
        if (socketGroups[group] === undefined) {
            socketGroups[group] = socket.id
            sockets[socket.id] = group
        }
    })

    socket.on('commit', (groupList) => {
        if (sockets[socket.id] === undefined || sockets[socket.id] === null || socketGroups[sockets[socket.id]] !== socket.id
        || Object.keys(groupList).length !== Object.keys(lists[sockets[socket.id]]).length) {
            return
        }
        lists[sockets[socket.id]] = groupList
        exportToFile()
    })

    socket.on('disconnect', () => {
        delete socketGroups[sockets[socket.id]]
        delete sockets[socket.id]
    })
})

function exportToFile() {
    const jsonData = JSON.parse(JSON.stringify(lists))
    fs.writeFile('./data.json', JSON.stringify(jsonData), err => {
        if (err) {
            console.error(err)
        }
    })
    const passData = JSON.parse(JSON.stringify(passwords))
    fs.writeFile('./pass.json', JSON.stringify(passData), err => {
        if (err) {
            console.error(err)
        }
    })
}

async function calcWinners() {
    const date = new Date()

    // sort in age groups
    const ageGroups = {}
    for (const group in lists) {
        const groupList = lists[group]
        for (const uid in groupList) {
            if (uid === "group") {
                continue
            }
            if (ageGroups[date.getFullYear()-groupList[uid].cert.age] === undefined) {
                ageGroups[date.getFullYear()-groupList[uid].cert.age] = {}
            }
            if (ageGroups[date.getFullYear()-groupList[uid].cert.age][groupList[uid].cert.gender] === undefined) {
                ageGroups[date.getFullYear()-groupList[uid].cert.age][groupList[uid].cert.gender] = {}
            }
            ageGroups[date.getFullYear()-groupList[uid].cert.age][groupList[uid].cert.gender][uid+" ("+group+")"] = groupList[uid]
        }
    }

    // sort out
    for (const age in ageGroups) {
        const ageGroup = ageGroups[age]
        for (const gender in ageGroup) {
            const genderGroup = ageGroup[gender]
            let topHere = 0
            for (let i = 0; i < 2; i++) {
                for (const uid in genderGroup) {
                    const data = genderGroup[uid]
                    if (data.points.sum < topHere) {
                        delete genderGroup[uid]
                    } else {
                        topHere = data.points.sum
                    }
                }
            }
        }
    }

    //console.log(ageGroups)

    // sort in gender
    const allBest = {
        true: {},
        false: {}
    }
    for (const age in ageGroups) {
        const ageGroup = ageGroups[age]
        for (const gender in ageGroup) {
            const genderGroup = ageGroup[gender]
            for (let i = 0; i < 2; i++) {
                for (const uid in genderGroup) {
                    allBest[gender][uid] = genderGroup[uid]
                }
            }
        }
    }

    // sort out
    for (const gender in allBest) {
        let topHere = 0
        const genderGroup = allBest[gender]
        for (let i = 0; i < 2 ; i++) {
            for (const uid in genderGroup) {
                const data = genderGroup[uid]
                if (data.points.sum-data.cert.needed < topHere) {
                    delete genderGroup[uid]
                } else {
                    topHere = data.points.sum-data.cert.needed
                }
            }
        }
    }

    //console.log(allBest)
    // send data to mobile clients
    const tmpLists = {}
    for (const group in lists) {
        if (socketGroups[group] === undefined) {
            tmpLists[group] = lists[group]
        }
    }
    mo.emit('setList', tmpLists)

    setTimeout(() => {
        calcWinners()
    }, 1000)
}

function serverConsole() {
    readline.question("> ", cmd => {
        //console.log("Server: " + cmd)
        // command input
        const args = cmd.split(" ")
        switch (args[0]) {
            case "mobiles": {
                console.log("Registered mobile clients:")
                for (const mobile in sockets) {
                    console.log(mobile + ": " + sockets[mobile])
                }
                break
            }
            case "calcs": {
                console.log("Registered calculator clients:")
                for (const calc in calcSock) {
                    console.log(calc + ": " + calcSock[calc])
                }
                break
            }
            default: {
                console.log(args[0] + " is not a valid command!")
            }
        }
        serverConsole()
    })
}

// listen
server.listen(port, "0.0.0.0", () => {
    console.log(`Listening for connections on ${port}`)
})
mobileServer.listen(mobilePort, "0.0.0.0", () => {
    console.log(`Listening for connections on ${mobilePort}`)
})

calcWinners().then()
setTimeout(() => {
    serverConsole()
}, 100)
