// two genders
let gender = true

// ac consts
let ACs = {
    girl: {
        sprint: {
            50: {a: 3.64800, c: 0.00660, name: "50m"},
            75: {a: 3.99800, c: 0.00660, name: "75m"},
            100: {a: 4.00620, c: 0.00656, name: "100m"}
        },
        run: {
            800: {a: 2.02320, c: 0.00647, name: "800m"},
            2000: {a: 1.80000, c: 0.00540, name: "2000m"},
            3000: {a: 1.75000, c: 0.00500, name: "3000m"}
        },
        jump: {
            highjump: {a: 0.88070, c: 0.00068, name: "Hochsprung"},
            longjump: {a: 1.09350, c: 0.00208, name: "Weitsprung"}
        },
        ball: {
            shotput: {a: 1.27900, c: 0.00398, name: "Kugelstoßen"},
            slingshot: {a: 1.08500, c: 0.00921, name: "Schleuderball"},
            Ball200G: {a: 1.41490, c: 0.01039, name: "200g"},
            Ball80G: {a: 2.02320, c: 0.00874, name: "80g"}
        }
    },
    boy: {
        sprint: {
            50: {a: 3.79000, c: 0.00690, name: "50m"},
            75: {a: 4.10000, c: 0.00664, name: "75m"},
            100: {a: 4.34100, c: 0.00676, name: "100m"}
        },
        run: {
            1000: {a: 2.15800, c: 0.00600, name: "1000m"},
            2000: {a: 1.78400, c: 0.00600, name: "2000m"},
            3000: {a: 1.70000, c: 0.00580, name: "3000m"}
        },
        jump: {
            highjump: {a: 0.84100, c: 0.00080, name: "Hochsprung"},
            longjump: {a: 1.15028, c: 0.00219, name: "Weitsprung"}
        },
        ball: {
            shotput: {a: 1.42500, c: 0.00370, name: "Kugelstoßen"},
            slingshot: {a: 1.59500, c: 0.009125, name: "Schleuderball"},
            Ball200G: {a: 1.93600, c: 0.01240, name: "200g"},
            Ball80G: {a: 2.80000, c: 0.01100, name: "80g"}
        }
    }
}

function genderSwap() {
    gender = !gender;
    let gString = "Mädchen";
    let gColor = "green";
    if (!gender) {
        gString = "Jungen"
        gColor = "blue"
        document.getElementById("gRun").href = "javascript:runPoints(Number(document.getElementById('runMin').value*60)+Number(document.getElementById('runSec').value), 1000)"
        document.getElementById("gRun").innerText = "1000m"
    } else {
        document.getElementById("gRun").href = "javascript:runPoints(Number(document.getElementById('runMin').value*60)+Number(document.getElementById('runSec').value), 800)"
        document.getElementById("gRun").innerText = "800m"
    }
    document.getElementById("gender").innerText = gString
    document.getElementById("gender").style.color = gColor
}

function addPoints() {
    document.getElementById("points").innerText = String(Number(document.getElementById("sprintPoints").innerText)+Number(document.getElementById("runPoints").innerText))
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
    document.getElementById("sprintPoints").innerText = String(points)
    addPoints();
}

function runPoints(sec, dist) {
    let points = 0
    let a,c
    if (gender) {
        a = ACs.girl.run[dist].a;
        c = ACs.girl.run[dist].c;
    } else {
        a = ACs.boy.run[dist].a;
        c = ACs.boy.run[dist].c;
    }
    sec = Math.abs(sec);
    points = Math.round((dist / sec - a) / c);
    console.log(sec + " " + dist + " " + a +" " + c)
    if (points <= 0 || points >= 1000) {
        return;
    }
    document.getElementById("runPoints").innerText = String(points)
    addPoints();
}
