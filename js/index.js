// two genders
let gender = true

// lists
let allList = {}

// pdf
const { PDFDocument, StandardFonts, rgb } = PDFLib;

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
document.getElementById("age").onchange = function () {addPoints();}
document.getElementById("addBtn").onclick = function () {
    if (document.getElementById("uid").value === "" || allList[document.getElementById("uid").value] !== undefined ||
        document.getElementById("uid").value.match(/[^A-Za-z0-9 ]/)) {
        alert("Gib bitte einen einzigartigen Identifikator aus Buchstaben und Zahlen an!")
        return
    }
    if (Number(document.getElementById("points").innerText) === 0) {
        alert("Gib bitte mindestens eine Disziplin an!")
        return;
    }
    if (document.getElementById("age").value === "null") {
        alert("Gib bitte ein Alter an!")
        return;
    }
    if (
        // not all disciplines given
        Number(document.getElementById("sprintPoints").innerText) === 0 ||
        Number(document.getElementById("runPoints").innerText) === 0 ||
        Number(document.getElementById("jumpPoints").innerText) === 0 ||
        Number(document.getElementById("ballPoints").innerText) === 0
    ) {
        const rs = confirm("Du hast nicht alle Disziplinen angegeben, so werden vielleicht nicht die richtigen Punkte verwendet. Bist du sicher, dass du fortfahren möchtest?")
        if (!rs) {
            return;
        }
    }
    const uid = document.getElementById("uid").value;
    allList[uid] = {
        points: {
            sum: Number(document.getElementById("points").innerText),
            sprint: Number(document.getElementById("sprintPoints").innerText),
            run: Number(document.getElementById("runPoints").innerText),
            jump: Number(document.getElementById("jumpPoints").innerText),
            ball: Number(document.getElementById("ballPoints").innerText)
        },
        values: {
            sprint: Number(document.getElementById("sprintSec").value),
            run: Number(document.getElementById('runMin').value*60)+Number(document.getElementById('runSec').value),
            jump: Number(document.getElementById("jumpM").value),
            ball: Number(document.getElementById("ballM").value),
        },
        cert: document.getElementById("cert").innerText.split(" ")[0]
    }
    for (const points of document.getElementsByClassName("reset")) {
        points.innerHTML = "0";
    }
    for (const value of document.getElementsByTagName("input")) {
        value.value = ""
    }
    document.getElementById("cert").innerText = "Keine Eingabe"
    document.getElementById("age").value = "null"
    calcList()
}

// functions

async function createPdf(){
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    for (const uid in allList) {
        const data = allList[uid];
        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()
        console.log(width + " " + height)
        const fontSize = 18
        page.drawText(uid, {
            x: width/2,
            y: height/2-100,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })
        page.drawText(String(data.points.sum), {
            x: 300,
            y: 500,
            size: 14,
            font: timesRomanFont,
            color: rgb(0,0,0)
        })
    }

    //const pdfBytes = await pdfDoc.save()
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    const iframe = document.createElement("iframe")
    iframe.src = pdfDataUri
    iframe.setAttribute("width", String(window.innerWidth-50));
    iframe.setAttribute("height", String(window.innerHeight-50));
    for (const div of document.getElementById("body").getElementsByTagName("div")) {
        div.style.display = "none"
    }
    document.getElementById("body").appendChild(iframe)
}

function genderSwap() {
    gender = !gender;
    let gString = "Mädchen";
    let gColor = "green";
    if (!gender) {
        gString = "Jungen"
        gColor = "blue"
        document.getElementById("run1").href = "javascript:runPoints(Number(document.getElementById('runMin').value*60)+Number(document.getElementById('runSec').value), 1000)"
        document.getElementById("run1").innerText = "1000m"
    } else {
        document.getElementById("run1").href = "javascript:runPoints(Number(document.getElementById('runMin').value*60)+Number(document.getElementById('runSec').value), 800)"
        document.getElementById("run1").innerText = "800m"
    }
    document.getElementById("gender").innerText = gString
    document.getElementById("gender").style.color = gColor
}

function addPoints() {
    let points = [
        Number(document.getElementById("sprintPoints").innerText),
        Number(document.getElementById("runPoints").innerText),
        Number(document.getElementById("jumpPoints").innerText),
        Number(document.getElementById("ballPoints").innerText)
    ]
    let sum = 0
    let low
    for (const dPoints of points) {
        if (low === undefined) {
            low = dPoints
        } else if (low >= dPoints) {
            sum += low
            low = dPoints
        } else {
            sum += dPoints
        }
    }
    document.getElementById("points").innerText = String(sum)
    calcCert(sum)
}

function calcCert(points) {
    let age = document.getElementById("age").value
    if (age === "null") {
        return
    }
    let limits = ACs.girl.certificates;
    if (!gender) {
        limits = ACs.boy.certificates;
    }
    let overflow = points - limits[age].s
    let cert = "<span style='color: lime'>Teilnehmerurkunde</span> <span style='color: #424242'>(" + overflow + " von Siegerurkunde)</span>"
    if (limits[age].e < points) {
        overflow = "+"+(points-limits[age].e)
        cert = "<span style='color: gold'>Ehrenurkunde</span> <span style='color: #424242'>" + overflow + "</span>"
    } else if (limits[age].s < points) {
        let overflow = points - limits[age].e
        cert = "<span style='color: white'>Siegerurkunde</span> <span style='color: #424242'>(" + overflow + " von Ehrenurkunde)</span>"
    }
    document.getElementById("cert").innerHTML = cert;
}

function calcList() {
    for (const uid in allList) {
        console.log(allList[uid])
        let row = document.createElement("TR")
        row.innerHTML = "<td style=\"max-width: 150px\">" + uid + "</td>\n" +
            "<td>" + allList[uid].points.sum + "</td>\n" +
            "<td>" + allList[uid].cert + "</td>"
        document.getElementById("listBody").append(row)
    }
}

function sprintPoints(sec, dist) {
    let points = 0
    let a,c
    if (gender) {
        a = ACs.girl.sprint[dist].a;
        c = ACs.girl.sprint[dist].c;
    } else {
        a = ACs.boy.sprint[dist].a;
        c = ACs.boy.sprint[dist].c;
    }
    let add = 0.24
    if (!document.getElementById("tolerance").checked) {
        add = 0
    }
    sec = Math.abs(sec);
    points = Math.round((dist / (sec + add) - a) / c);
    if (points <= 0 || points >= 1000) {
        return;
    }

    let sprintId = ACs.girl.sprint[dist].id
    console.log(sprintId)
    for (let discipline of document.getElementsByClassName("sprint")[0].getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById(sprintId).classList.add("active")

    document.getElementById("sprintPoints").innerText = String(points)
    addPoints();
}

function runPoints(sec, dist) {
    let points = 0
    let a,c,runId
    if (gender) {
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
    console.log(sec + " " + dist + " " + a +" " + c)
    if (points <= 0 || points >= 1000) {
        return;
    }

    console.log(runId)
    for (let discipline of document.getElementsByClassName("run")[0].getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById(runId).classList.add("active")

    document.getElementById("runPoints").innerText = String(points)
    addPoints();
}

function jumpPoints(dist, type) {
    let points = 0
    let a,c
    if (gender) {
        a = ACs.girl.jump[type].a;
        c = ACs.girl.jump[type].c;
    } else {
        a = ACs.boy.jump[type].a;
        c = ACs.boy.jump[type].c;
    }
    dist = Math.abs(dist);
    points = Math.round((Math.sqrt(dist) - a) / c);
    console.log(points + " " + dist + " " + type)
    if (points <= 0 || points >= 1000) {
        return;
    }

    let jumpId = ACs.girl.jump[type].id
    console.log(jumpId)
    for (let discipline of document.getElementsByClassName("jump")[0].getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById(jumpId).classList.add("active")

    document.getElementById("jumpPoints").innerText = String(points)
    addPoints();
}

function ballPoints(dist, type) {
    let points = 0
    let a,c
    if (gender) {
        a = ACs.girl.ball[type].a;
        c = ACs.girl.ball[type].c;
    } else {
        a = ACs.boy.ball[type].a;
        c = ACs.boy.ball[type].c;
    }
    dist = Math.abs(dist);
    points = Math.round((Math.sqrt(dist) - a) / c);
    if (points <= 0 || points >= 1000) {
        return;
    }

    let ballId = ACs.girl.ball[type].id
    console.log(ballId)
    for (let discipline of document.getElementsByClassName("ball")[0].getElementsByTagName("a")) {
        discipline.classList.remove("active")
    }
    document.getElementById(ballId).classList.add("active")

    document.getElementById("ballPoints").innerText = String(points)
    addPoints();
}
