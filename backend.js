const fs = require('fs'); // files

const express = require('express')
const backend = express()
const port = 1870
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(backend)
const io = new Server(server, {pingInterval: 1500, pingTimeout: 5000})

backend.use(express.static("./public"))
backend.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

// init vars
let lists = {}

fs.readFile('./data.json', 'utf8', (err, data) => {
    if (!err) {
        lists = JSON.parse(data)
        console.log("Restored lists")
    }
})

// code
io.on('connection', (socket) => {
    // client connected
    console.log("Client connected: " + socket.id)
    // get group data if any
    socket.on('edit', (socketGroup) => {
        console.log(socket.id + " requests group " + socketGroup)
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
        const jsonData = JSON.parse(JSON.stringify(lists))
        fs.writeFile('./data.json', JSON.stringify(jsonData), err => {
            if (err) {
                console.error(err)
            }
        })
        const listOfLists = {}
        for (const list in lists) {
            listOfLists[list] = Object.keys(lists[list]).length-1
        }
        io.emit('lists', listOfLists)
        console.log(socket.id + "'s list saved")
    })
})

// listen
server.listen(port, "0.0.0.0", () => {
    console.log(`Listening for connections on ${port}`)
})

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

    setTimeout(() => {
        calcWinners()
    }, 1000)
}
calcWinners().then()