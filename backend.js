const express = require('express')
const backend = express()
const port = 187
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(backend)
const io = new Server(server, {pingInterval: 1500, pingTimeout: 5000})

backend.use(express.static("./public"))
backend.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

// init vars
const lists = {}
const sockets = {}

// code
io.on('connection', (socket) => {
    // client connected
    sockets[socket.id] = ""
    console.log("Client connected: " + socket.id)
    socket.on('commit', (socketList) => {
        lists[socket.id] = socketList
        console.log(lists)
    })
})

// listen
server.listen(port, "0.0.0.0", () => {
    console.log(`Listening for connections on ${port}`)
})