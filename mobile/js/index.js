// init server connection

// current vars
let discipline = ""
let group = ""

let lists = {}
// io work
const socket = io();
socket.on('setList', (originList) => {
    if (group !== "" && originList[group] !== lists[group]) {
        originList[group] = lists[group]
    }
    lists = originList
    //console.log(lists)
    // server list received
    for (const gid in lists) {
        if (document.getElementById("group%"+gid) === null) {
            const row = document.createElement("tr")
            const nameCol = document.createElement("td")
            const countCol = document.createElement("td")
            nameCol.innerText = gid
            countCol.innerText = String(Object.keys(lists[gid]).length-1)
            row.classList.add("groupEntry")
            row.id = "group%"+gid
            row.onclick = function () {
                // group select
                group = gid
                socket.emit('selectGroup', gid)
                document.getElementById("group").innerText = gid
                if (document.getElementById("setup") !== null && discipline !== "") {
                    document.getElementById("setup").remove()
                }
                if (discipline !== "") {
                    document.getElementById("menu").classList.remove("active")
                }
                for (const activeGroup of document.getElementById("groups").getElementsByClassName("active")) {
                    activeGroup.removeAttribute("disabled")
                    activeGroup.classList.remove("active")
                }
                row.setAttribute("disabled", "")
                row.classList.add("active")

                while (document.getElementsByClassName("dataEntry").length > 0) {
                    for (const dataEntry of document.getElementsByClassName("dataEntry")) {
                        dataEntry.remove()
                    }
                }
                for (const uid in lists[gid]) {
                    if (uid === "group") {
                        continue
                    }
                    // create table data rows
                    const row = document.createElement("tr")
                    const nameCol = document.createElement("td")
                    const dataCol = document.createElement("td")
                    const typeCol = document.createElement("td")
                    nameCol.innerText = uid
                    dataCol.classList.add("dataType")
                    typeCol.classList.add("distType")
                    row.classList.add("dataEntry")
                    row.id = "data-"+uid
                    row.appendChild(nameCol)
                    row.appendChild(dataCol)
                    row.appendChild(typeCol)
                    document.getElementById("dataBody").appendChild(row)
                }
                loadDiscipline(discipline)
            }
            row.appendChild(nameCol)
            row.appendChild(countCol)
            document.getElementById("groups").appendChild(row)
        }
    }
    for (const group of document.getElementsByClassName("groupEntry")) {
        const gid = group.id.split("%")[1]
        if (lists[gid] === undefined) {
            group.remove()
        }
    }
})

socket.on('reAuth', () => {
    socket.emit('authenticate', prompt("Password..."))
})
socket.on('kick', () => {
    window.location.reload()
})

// ac consts
let ACs = {
    girl: {
        sprint: {
            50: {a: 3.64800, c: 0.00660, name: "50m", id: "sprint1"},
            75: {a: 3.99800, c: 0.00660, name: "75m", id: "sprint2"},
            100: {a: 4.00620, c: 0.00656, name: "100m", id: "sprint3"}
        },
        run: {
            800: {a: 2.02320, c: 0.00647, name: "800m", id: "run1"},
            2000: {a: 1.80000, c: 0.00540, name: "2000m", id: "run2"},
            3000: {a: 1.75000, c: 0.00500, name: "3000m", id: "run3"}
        },
        jump: {
            highjump: {a: 0.88070, c: 0.00068, name: "Hochsprung", id: "jump1"},
            longjump: {a: 1.09350, c: 0.00208, name: "Weitsprung", id: "jump2"}
        },
        ball: {
            shotput: {a: 1.27900, c: 0.00398, name: "Kugelstoßen", id: "ball3"},
            slingshot: {a: 1.08500, c: 0.00921, name: "Schleuderball", id: "ball4"},
            Ball200G: {a: 1.41490, c: 0.01039, name: "200g", id: "ball2"},
            Ball80G: {a: 2.02320, c: 0.00874, name: "80g", id: "ball1"}
        },
        certificates: {
            8: {s: 475, e: 625},
            9: {s: 550, e: 725},
            10: {s: 625, e: 825},
            11: {s: 700, e: 900},
            12: {s: 775, e: 975},
            13: {s: 825, e: 1025},
            14: {s: 850, e: 1050},
            15: {s: 875, e: 1075},
            16: {s: 900, e: 1100},
            17: {s: 925, e: 1125},
            18: {s: 950, e: 1150},
            19: {s: 950, e: 1150}
        }
    },
    boy: {
        sprint: {
            50: {a: 3.79000, c: 0.00690, name: "50m", id: "sprint1"},
            75: {a: 4.10000, c: 0.00664, name: "75m", id: "sprint2"},
            100: {a: 4.34100, c: 0.00676, name: "100m", id: "sprint3"}
        },
        run: {
            1000: {a: 2.15800, c: 0.00600, name: "1000m", id: "run1"},
            2000: {a: 1.78400, c: 0.00600, name: "2000m", id: "run2"},
            3000: {a: 1.70000, c: 0.00580, name: "3000m", id: "run3"}
        },
        jump: {
            highjump: {a: 0.84100, c: 0.00080, name: "Hochsprung", id: "jump1"},
            longjump: {a: 1.15028, c: 0.00219, name: "Weitsprung", id: "jump2"}
        },
        ball: {
            shotput: {a: 1.42500, c: 0.00370, name: "Kugelstoßen", id: "ball3"},
            slingshot: {a: 1.59500, c: 0.009125, name: "Schleuderball", id: "ball4"},
            Ball200G: {a: 1.93600, c: 0.01240, name: "200g", id: "ball2"},
            Ball80G: {a: 2.80000, c: 0.01100, name: "80g", id: "ball1"}
        },
        certificates: {
            8: {s: 450, e: 575},
            9: {s: 525, e: 675},
            10: {s: 600, e: 775},
            11: {s: 675, e: 875},
            12: {s: 750, e: 975},
            13: {s: 825, e: 1050},
            14: {s: 900, e: 1125},
            15: {s: 975, e: 1225},
            16: {s: 1050, e: 1325},
            17: {s: 1125, e: 1400},
            18: {s: 1200, e: 1475},
            19: {s: 1275, e: 1550}
        }
    }
}

// code
document.getElementById("menu-toggle").onclick = function () {
    document.getElementById("menu").classList.toggle("active")
}
for (const dispBtn of document.getElementsByClassName("dispBtn")) {
    dispBtn.onclick = function () {
        // discipline select
        discipline = dispBtn.getAttribute("value")
        if (document.getElementById("setup") !== null && group !== "") {
            document.getElementById("setup").remove()
        }
        if (group !== "") {
            document.getElementById("menu").classList.remove("active")
        }
        for (const activeBtn of document.getElementById("disciplines").getElementsByClassName("active")) {
            activeBtn.removeAttribute("disabled")
            activeBtn.classList.remove("active")
        }
        dispBtn.setAttribute("disabled", "")
        dispBtn.classList.add("active")
        loadDiscipline(discipline)
    }
}
//socket.emit("authenticate", (prompt("Password")))

// functions

function sendResults() {
    // send only local changes
    console.log(lists[group] + " | commit")
    if (group === "") {
        return
    }
    socket.emit('commit', lists[group])
}

function loadDiscipline(disp) {
    // fill table with applying discipline settings
    if (disp === "") {
        return
    }
    for (const dataEntry of document.getElementsByClassName("dataEntry")) {
        const uid = dataEntry.id.split("-")[1]
        const dataCol = dataEntry.getElementsByClassName("dataType")[0]
        const typeCol = dataEntry.getElementsByClassName("distType")[0]
        switch (disp) {
            case "sprint": {
                dataCol.innerHTML = "<p align=\"center\"><input id=\"sprintSec" + uid + "\" type=\"number\" step=\"0.01\" placeholder=\"0.00\" min=\"0\" value='" + lists[group][uid].values.sprint + "'><br>sek</p>" +
                    "<p><input style=\"width: min-content\" type=\"checkbox\" id=\"tolerance" + uid + "\" checked> <i class='bx bxs-stopwatch' ></i></p>"
                typeCol.innerHTML = "<p align=\"center\">" +
                    "<a href=\"javascript:sprintPoints('" + uid + "', document.getElementById('sprintSec" + uid + "').value, 50)\" class=\"sprint1\">50m</a><br>" +
                    "<a href=\"javascript:sprintPoints('" + uid + "', document.getElementById('sprintSec" + uid + "').value, 75)\" class=\"sprint2\">75m</a><br>" +
                    "<a href=\"javascript:sprintPoints('" + uid + "', document.getElementById('sprintSec" + uid + "').value, 100)\" class=\"sprint3\">100m</a><br>" +
                    "</p>"
                break
            }
            case "run": {
                dataCol.innerHTML = "<p align=\"center\">" +
                    "<input id=\"runMin" + uid + "\" type=\"number\" placeholder=\"0.00\" min=\"0\" value='" + Math.floor(lists[group][uid].values.run/60) + "'>" +
                    "<br>min</p>" +
                    "<p align=\"center\">" +
                    "<input id=\"runSec" + uid + "\" type=\"number\" placeholder=\"0.00\" min=\"0\" value='" + (lists[group][uid].values.run%60) + "'>" +
                    "<br>sek</p>"
                typeCol.innerHTML = "<p align=\"center\">"
                if (lists[group][uid].cert.gender) {
                    typeCol.innerHTML = typeCol.innerHTML + "<a href=\"javascript:runPoints('" + uid + "', Number(document.getElementById('runMin" + uid + "').value*60)+Number(document.getElementById('runSec" + uid + "').value), 800)\" class=\"run1\">800m</a><br>"
                } else {
                    typeCol.innerHTML = typeCol.innerHTML + "<a href=\"javascript:runPoints('" + uid + "', Number(document.getElementById('runMin" + uid + "').value*60)+Number(document.getElementById('runSec" + uid + "').value), 1000)\" class=\"run1\">1000m</a><br>"
                }
                typeCol.innerHTML = typeCol.innerHTML +
                    "<a href=\"javascript:runPoints('" + uid + "', Number(document.getElementById('runMin" + uid + "').value*60)+Number(document.getElementById('runSec" + uid + "').value), 2000)\" class=\"run2\">2000m</a><br>" +
                    "<a href=\"javascript:runPoints('" + uid + "', Number(document.getElementById('runMin" + uid + "').value*60)+Number(document.getElementById('runSec" + uid + "').value), 3000)\" class=\"run3\">3000m</a><br>" +
                    "</p>"
                break
            }
            case "jump": {
                dataCol.innerHTML = "<p align=\"center\"><input id=\"jumpM" + uid + "\" type=\"number\" step=\"0.01\" placeholder=\"0.00\" min=\"0\" value='" + lists[group][uid].values.jump + "'><br>m</p>"
                typeCol.innerHTML = "<p align=\"center\">" +
                    "<a href=\"javascript:jumpPoints('" + uid + "', document.getElementById('jumpM" + uid + "').value, 'highjump')\" class=\"jump1\">Hoch</a><br>" +
                    "<a href=\"javascript:jumpPoints('" + uid + "', document.getElementById('jumpM" + uid + "').value, 'longjump')\" class=\"jump2\">Weit</a><br>" +
                    "</p>"
                break
            }
            case "ball": {
                dataCol.innerHTML = "<p align=\"center\"><input id=\"ballM" + uid + "\" type=\"number\" step=\"0.01\" placeholder=\"0.00\" min=\"0\" value='" + lists[group][uid].values.ball + "'><br>m</p>"
                typeCol.innerHTML = "<p align=\"center\">" +
                    "<a href=\"javascript:ballPoints('" + uid + "', document.getElementById('ballM" + uid + "').value, 'Ball80G')\" class=\"ball1\">80g</a><br>" +
                    "<a href=\"javascript:ballPoints('" + uid + "', document.getElementById('ballM" + uid + "').value, 'Ball200G')\" class=\"ball2\">200g</a><br>" +
                    "<a href=\"javascript:ballPoints('" + uid + "', document.getElementById('ballM" + uid + "').value, 'shotput')\" class=\"ball3\">Kugel</a><br>" +
                    "<a href=\"javascript:ballPoints('" + uid + "', document.getElementById('ballM" + uid + "').value, 'slingshot')\" class=\"ball4\">Schleuder</a><br>" +
                    "</p>"
                break
            }
        }
        for (const type of lists[group][uid].values.types) {
            if (dataEntry.getElementsByClassName(type).length > 0) {
                dataEntry.getElementsByClassName(type)[0].classList.add("active")
            }
        }
    }
}

function loadUid(uid) {
}

function addPoints(uid) {
    let points = [
        lists[group][uid].points.sprint,
        lists[group][uid].points.run,
        lists[group][uid].points.jump,
        lists[group][uid].points.ball
    ]
    let sum = 0
    let low = 0
    for (const dPoints of points) {
        if (low === 0) {
            low = dPoints
        } else if (low >= dPoints) {
            sum += low
            low = dPoints
        } else {
            sum += dPoints
        }
    }
    lists[group][uid].points.sum = sum
    calcCert(sum, uid)
}

function calcCert(points, uid) {
    let age = (new Date().getFullYear()) - (lists[group][uid].cert.age)
    if (isNaN(age)) {
        console.log("age is NaN" + age)
        return
    }
    if (age > 19) {
        age = 19
    }
    let limits = ACs.girl.certificates;
    if (!lists[group][uid].cert.gender) {
        limits = ACs.boy.certificates;
    }
    if (limits[age].e < points) {
        lists[group][uid].cert.name = "Ehrenurkunde"
    } else if (limits[age].s < points) {
        lists[group][uid].cert.name = "Siegerurkunde"
    } else {
        lists[group][uid].cert.name = "Teilnehmerurkunde"
    }
    sendResults()
    //document.getElementById("cert").innerHTML = cert;
}

function calcList() {
}

function sprintPoints(uid, sec, dist) {
    let points = 0
    let a,c
    if (lists[group][uid].cert.gender) {
        a = ACs.girl.sprint[dist].a;
        c = ACs.girl.sprint[dist].c;
    } else {
        a = ACs.boy.sprint[dist].a;
        c = ACs.boy.sprint[dist].c;
    }
    let add = 0.24
    if (!document.getElementById("tolerance"+uid).checked) {
        add = 0
    }
    sec = Math.abs(sec);
    points = Math.round((dist / (sec + add) - a) / c);
    if (points <= 0 || points >= 1000) {
        document.getElementById("sprintSec"+uid).value = lists[group][uid].values.sprint
        return;
    }

    let sprintId = ACs.girl.sprint[dist].id
    console.log(sprintId + " | " + points)
    for (let discipline of document.getElementById("data-"+uid).getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById("data-"+uid).getElementsByClassName(sprintId)[0].classList.add("active")

    lists[group][uid].points.sprint = points
    lists[group][uid].values.sprint = sec

    let include = false
    for (const type of lists[group][uid].values.types) {
        if (type.toString().includes("sprint")) {
            lists[group][uid].values.types[lists[group][uid].values.types.indexOf(type)] = sprintId
            include = true
            break
        }
    }
    if (!include) {
        lists[group][uid].values.types[lists[group][uid].values.types.length] = sprintId
    }
    console.log(lists[group][uid].values.types)
    addPoints(uid);
}

function runPoints(uid, sec, dist) {
    let points = 0
    let a,c,runId
    if (lists[group][uid].cert.gender) {
        a = ACs.girl.run[dist].a;
        c = ACs.girl.run[dist].c;
        runId = ACs.girl.run[dist].id
    } else {
        a = ACs.boy.run[dist].a;
        c = ACs.boy.run[dist].c;
        runId = ACs.boy.run[dist].id
    }
    sec = Math.abs(sec);
    points = Math.round((dist / sec - a) / c);
    if (points <= 0 || points >= 1000) {
        document.getElementById("runMin"+uid).value = Math.floor(lists[group][uid].values.run/60)
        document.getElementById("runSec"+uid).value = lists[group][uid].values.run%60
        return;
    }

    if (lists[group][uid].cert.gender) {
        runId = ACs.girl.run[dist].id
    } else {
        runId = ACs.boy.run[dist].id
    }
    console.log(runId + " | " + points)
    for (let discipline of document.getElementById("data-"+uid).getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById("data-"+uid).getElementsByClassName(runId)[0].classList.add("active")

    lists[group][uid].points.run = points
    lists[group][uid].values.run = sec

    let include = false
    for (const type of lists[group][uid].values.types) {
        if (type.toString().includes("run")) {
            lists[group][uid].values.types[lists[group][uid].values.types.indexOf(type)] = runId
            include = true
            break
        }
    }
    if (!include) {
        lists[group][uid].values.types[lists[group][uid].values.types.length] = runId
    }
    console.log(lists[group][uid].values.types)
    addPoints(uid);
}

function jumpPoints(uid, dist, type) {
    let points = 0
    let a,c
    if (lists[group][uid].cert.gender) {
        a = ACs.girl.jump[type].a;
        c = ACs.girl.jump[type].c;
    } else {
        a = ACs.boy.jump[type].a;
        c = ACs.boy.jump[type].c;
    }
    dist = Math.abs(dist);
    points = Math.round((Math.sqrt(dist) - a) / c);
    if (points <= 0 || points >= 1000) {
        document.getElementById("jumpM"+uid).value = lists[group][uid].values.jump
        return;
    }

    let jumpId = ACs.girl.jump[type].id
    console.log(jumpId + " | " + points)
    for (let discipline of document.getElementById("data-"+uid).getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById("data-"+uid).getElementsByClassName(jumpId)[0].classList.add("active")

    lists[group][uid].points.jump = points
    lists[group][uid].values.jump = dist

    let include = false
    for (const type of lists[group][uid].values.types) {
        if (type.toString().includes("jump")) {
            lists[group][uid].values.types[lists[group][uid].values.types.indexOf(type)] = jumpId
            include = true
            break
        }
    }
    if (!include) {
        lists[group][uid].values.types[lists[group][uid].values.types.length] = jumpId
    }
    console.log(lists[group][uid].values.types)
    addPoints(uid);
}

function ballPoints(uid, dist, type) {
    let points = 0
    let a,c
    if (lists[group][uid].cert.gender) {
        a = ACs.girl.ball[type].a;
        c = ACs.girl.ball[type].c;
    } else {
        a = ACs.boy.ball[type].a;
        c = ACs.boy.ball[type].c;
    }
    dist = Math.abs(dist);
    points = Math.round((Math.sqrt(dist) - a) / c);
    if (points <= 0 || points >= 1000) {
        document.getElementById("ballM"+uid).value = lists[group][uid].values.ball
        return;
    }

    let ballId = ACs.girl.ball[type].id
    console.log(ballId + " | " + points)
    for (let discipline of document.getElementById("data-"+uid).getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById("data-"+uid).getElementsByClassName(ballId)[0].classList.add("active")

    lists[group][uid].points.ball = points
    lists[group][uid].values.ball = dist

    let include = false
    for (const type of lists[group][uid].values.types) {
        if (type.toString().includes("ball")) {
            lists[group][uid].values.types[lists[group][uid].values.types.indexOf(type)] = ballId
            include = true
            break
        }
    }
    if (!include) {
        lists[group][uid].values.types[lists[group][uid].values.types.length] = ballId
    }
    console.log(lists[group][uid].values.types)
    addPoints(uid);
}
