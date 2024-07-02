const fs = require('fs'); // files

// require bcrypt
const bcrypt = require("bcrypt")

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

const readlineSystem = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const readline = require('readline')
const {all} = require("express/lib/application");
const moment = require("moment/moment");

backend.use(express.static("./public"))
backend.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});
mobileBackend.use(express.static("./mobile"))
mobileBackend.get('/', (req, res) => {
    res.sendFile(__dirname + '/mobile/index.html')
});

// init vars
const passwordsPreset = {
    calc: "BJS",
    mobile: "BJS"
}
let passwords = passwordsPreset
let lists = {}

const allBest = {
    true: {},
    false: {}
}

let calcAuth = {} // authentication
let mobileAuth = {} // authentication

let sockets = {} // mobile sockets -> group
let socketGroups = {} // group -> mobile socket

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
    if (passwords.calc === undefined) {
        passwords.calc = passwordsPreset.calc
    }
    if (passwords.mobile === undefined) {
        passwords.mobile = passwordsPreset.mobile
    }
})

// code
io.on('connection', (socket) => {
    // client connected
    //console.log("Client connected: " + socket.id)
    // get group data if any
    calcAuth[socket.id] = false
    socket.emit('reAuth')

    socket.on('authenticate', (password) => {
        if (password === passwords.calc) {
            socket.join('authenticated')
            calcAuth[socket.id] = true
            socket.emit('regroup')
            console.log("Authenticated calc " + socket.id)
        } else {
            socket.emit('reAuth')
        }
    })

    socket.on('edit', (socketGroup) => {
        if (!socket.in('authenticated') || socketGroup === "") {
            return
        }
        //console.log(socket.id + " requests group " + socketGroup)
        if (lists[socketGroup] !== undefined) {
            socket.emit('setList', getGroupSendList(socketGroup))
        } else {
            socket.emit('setList', {group: socketGroup})
        }
    })

    // save local changes
    socket.on('commit', (socketList) => {
        if (!socket.in('authenticated')) {
            console.log("Invalid commit")
            return
        }
        console.log(socket.id + " committed " + Object.keys(socketList))
        const group = socketList[Object.keys(socketList)[0]].group
        if (Object.keys(socketList).length > 1) {
            lists[group] = socketList
        } else if (lists[group] !== undefined) {
            delete lists[group]
        }
        exportToFile()
        const listOfLists = {}
        for (const list in lists) {
            if (lists[list].group !== undefined) {
                lists[list].group = list
            }
            listOfLists[list] = Object.keys(lists[list]).length-1
        }
        io.to('authenticated').emit('lists', listOfLists)
        mo.to('authenticated').emit('setList', lists)
        //console.log(socket.id + "'s list saved")
    })
})
mo.on('connection', (socket) => {
    // mobile client connected
    //console.log("Mobile client connected: " + socket.id)
    sockets[socket.id] = null
    socket.emit('reAuth')

    socket.on('authenticate', (password) => {
        if (password === passwords.mobile) {
            socket.join('authenticated')
            calcAuth[socket.id] = true
            socket.emit('setList', lists)
            console.log("Authenticated mobile " + socket.id)
        } else {
            socket.emit('reAuth')
        }
    })
    // client select group
    socket.on('selectGroup', (group) => {
        console.log(socket.id + " requests group " + group)
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
        console.log("Mobile commit: " + socket.id + " in group " + sockets[socket.id] + " with " + Object.keys(groupList).length + " entries")
        if (sockets[socket.id] === undefined || sockets[socket.id] === null || socketGroups[sockets[socket.id]] !== socket.id
        || Object.keys(groupList).length !== Object.keys(lists[sockets[socket.id]]).length) {
            console.log("Invalid commit")
            return
        }
        console.log("Mobile commit: " + socket.id + " in group " + sockets[socket.id] + " with " + Object.keys(groupList).length + " entries")
        lists[sockets[socket.id]] = groupList
        mo.to('authenticated').emit('setList', lists)
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
    exportPws()
}

function exportPws() {
    const passData = JSON.parse(JSON.stringify(passwords))
    fs.writeFile('./pass.json', JSON.stringify(passData), err => {
        if (err) {
            console.error(err)
        }
    })
}

function getGroupSendList(group) {
    const list = lists[group]
    list.group = group
    return list
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

    return allBest
}

function serverConsole() {
    readlineSystem.question("> ", cmd => {
        //console.log("Server: " + cmd)
        // command input
        const args = cmd.split(" ")
        switch (args[0]) {
            case "import": {
                // import Data from csv
                if (fs.existsSync('./import.csv')) {
                    console.log("Starting import...")
                    const startTime = Date.now()

                    // specify the path of the CSV file
                    const path = "import.csv";

                    // Create a read stream
                    const readStream = fs.createReadStream(path);

                    // Create a readline interface
                    const readInterface = readline.createInterface({
                        input: readStream
                    });

                    // Initialize an array to store the parsed data
                    let lineNumber = 0

                    // Event handler for reading lines
                    readInterface.on("line", (line) => {
                        const row = line.split(";");
                        if (lineNumber > 0) {
                            // error catching
                            if (
                                row.length < 5 ||
                                row[0].match(/[^A-Za-z0-9-ÄäÖöÜü ]/) ||
                                row[1].match(/[^A-Za-z0-9-ÄäÖöÜü ]/) ||
                                !moment(row[2], "DD.MM.yyyy", true).isValid() ||
                                !row[4].match(/[MWmw]/)
                            ) {
                                console.log("Line " + lineNumber + " is not formatted correctly!")
                            } else {
                                row[0] = row[0] + " " + row[1]
                                row[2] = moment(row[2], "DD.MM.yyyy", true).year()
                                if (lists[row[3]] === undefined) {
                                    lists[row[3]] = {}
                                }
                                if (lists[row[3]][row[0]] === undefined) {
                                    lists[row[3]][row[0]] = {}
                                    lists[row[3]][row[0]].group = row[3]
                                    lists[row[3]][row[0]].cert = {
                                        age: row[1],
                                        gender: row[3].toLowerCase() === "w",
                                        name: "DnS",
                                        needed: 1000
                                    }
                                    lists[row[3]][row[0]].points = {
                                        sum: 0,
                                        sprint: 0,
                                        run: 0,
                                        jump: 0,
                                        ball: 0
                                    }
                                    lists[row[3]][row[0]].values = {
                                        sprint: 0,
                                        run: 0,
                                        jump: 0,
                                        ball: 0,
                                        types: []
                                    }
                                }
                                console.log(lineNumber + ": " + row[0] + " in group " + row[3])
                            }
                        }
                        lineNumber++
                    });

                    // Event handler for the end of file
                    readInterface.on("close", () => {
                        const stopTime = Date.now()
                        console.log("Finished import in " + (stopTime-startTime) + "ms");
                        fs.renameSync('./import.csv', './import-' + Date.now() + ".csv")
                    });

                    // Event handler for handling errors
                    readInterface.on("error", (err) => {
                        console.error("Error reading the CSV file:", err);
                    });

                    for (const group in lists) {
                        console.log(lists[group])
                        const groupName = lists[group][Object.keys(group)[0]];
                        if (groupName !== undefined) {
                            lists[group].group = groupName
                        }
                    }

                    exportToFile()
                } else {
                    console.log("Couldn't find import.csv file in directory.")
                }
                break
            }
            case "mobiles": {
                console.log("Registered mobile clients:")
                sockets.forEach(mobile => console.log(mobile + ": " + sockets[mobile]))
                break
            }
            case "calcs": {
                console.log("Registered calculator clients:")
                for (const calc in calcAuth) {
                    console.log(calc + ": " + calcAuth[calc])
                }
                break
            }
            case "passCalc": {
                /*readline.question("Change web password > ", pw => {
                    if (pw !== "") {
                        /!*bcrypt
                            .hashSync(pw, 12)
                            .then(hash => {
                                console.log('Hash ', hash)
                                passwords.calc = hash
                                exportPws()
                            })
                            .catch(err => console.error(err.message))*!/
                        passwords.calc = bcrypt.hashSync(pw, 12)

                        console.log(passwords)
                        exportPws()
                    }
                })*/
                break
            }
            case "getHashes": {
                console.log(passwords)
                break
            }
            case "lists": {
                console.log(lists)
                break
            }
            case "winners": {
                console.log(calcWinners())
                break
            }
            case "": {
                break
            }
            default: {
                console.log(args[0] + " is not a valid command!")
            }
        }
        serverConsole()
    })
}

async function updateMobiles() {
    //console.log(allBest)
    // send data to mobile clients
    const tmpLists = {}
    for (const group in lists) {
        if (socketGroups[group] === undefined) {
            tmpLists[group] = lists[group]
        }
    }
    mo.to('authenticated').emit('setList', tmpLists)
    setTimeout(() => {
        updateMobiles().then()
    }, 150);
}

// listen
server.listen(port, "0.0.0.0", () => {
    console.log(`Listening for connections on ${port}`)
})
mobileServer.listen(mobilePort, "0.0.0.0", () => {
    console.log(`Listening for connections on ${mobilePort}`)
})
setTimeout(() => {
    serverConsole()
}, 100)

setTimeout(() => {
    updateMobiles().then()
}, 100);