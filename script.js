let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("h2");
let ctx = canvas.getContext("2d");
ctx.scale(30, 30);

const SHAPES = [
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[1, 1, 1], [0, 1, 0], [0, 0, 0]],
    [[1, 1], [1, 1]],
];

const COLORS = [
    "#fff", "#9b5fe0", "#16a4d8", "#60dbe8",
    "#8bd346", "#efdf48", "#f9a52c", "#d64e12"
];

const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let fallingPieceObj = null;
let score = 0;
let isPaused = false;
let pauseOpacity = 0;
let intervalId = null;

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push([]);
        for (let j = 0; j < COLS; j++) {
            grid[i].push(0);
        }
    }
    return grid;
}

function startGameLoop() {
    intervalId = setInterval(() => {
        if (!isPaused) {
            newGameState();
        }
    }, 500);
}

function newGameState() {
    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = randomPieceObject();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 0) {
                allFilled = false;
            }
        }
        if (allFilled) {
            count++;
            grid.splice(i, 1);
            grid.unshift(new Array(COLS).fill(0));
        }
    }

    if (count === 1) score += 10;
    else if (count === 2) score += 30;
    else if (count === 3) score += 50;
    else if (count > 3) score += 100;

    scoreboard.innerHTML = "Score: " + score;
}

function randomPieceObject() {
    let ran = Math.floor(Math.random() * 7);
    return {
        piece: SHAPES[ran],
        colorIndex: ran + 1,
        x: 4,
        y: 0
    };
}

function renderPiece() {
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === 1) {
                ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                ctx.fillRect(fallingPieceObj.x + j, fallingPieceObj.y + i, 1, 1);
            }
        }
    }
}

function moveDown() {
    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y += 1;
    } else {
        let piece = fallingPieceObj.piece;
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] === 1) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }

        if (fallingPieceObj.y === 0) {
            showGameOverPopup();
            return;
        }

        fallingPieceObj = null;
    }
    renderGame();
}

function moveLeft() {
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y)) {
        fallingPieceObj.x -= 1;
    }
    renderGame();
}

function moveRight() {
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y)) {
        fallingPieceObj.x += 1;
    }
    renderGame();
}

function rotate() {
    let rotatedPiece = [];
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }
    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }

    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece)) {
        fallingPieceObj.piece = rotatedPiece;
    }

    renderGame();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    if (grid[q][p] > 0) return true;
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGame() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    if (fallingPieceObj) renderPiece();
    drawPauseOverlay();
}

function drawPauseOverlay() {
    if (isPaused && pauseOpacity < 1) pauseOpacity += 0.05;
    else if (!isPaused && pauseOpacity > 0) pauseOpacity -= 0.05;

    if (pauseOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * pauseOpacity})`;
        ctx.fillRect(0, 0, COLS, ROWS);

        ctx.fillStyle = `rgba(255, 255, 255, ${pauseOpacity})`;
        ctx.fillRect(COLS / 2 - 0.5, ROWS / 2 - 2, 0.3, 4);
        ctx.fillRect(COLS / 2 + 0.2, ROWS / 2 - 2, 0.3, 4);

        ctx.font = "0.7px Arial";
        ctx.fillText("Paused", COLS / 2 - 1.5, ROWS / 2 + 3);
    }

    if (pauseOpacity > 0 && pauseOpacity <= 1) {
        requestAnimationFrame(drawPauseOverlay);
    }
}

function showGameOverPopup() {
    document.getElementById("finalScore").textContent = `Your score: ${score}`;
    document.getElementById("gameOverPopup").classList.remove("hidden");
    isPaused = true;
}

document.getElementById("restartBtn").addEventListener("click", () => {
    score = 0;
    grid = generateGrid();
    fallingPieceObj = null;
    scoreboard.innerHTML = "Score: 0";
    document.getElementById("gameOverPopup").classList.add("hidden");
    isPaused = false;
});

document.addEventListener("keydown", function (e) {
    if (!fallingPieceObj) return;
    let key = e.key;
    if (key === "ArrowDown") moveDown();
    else if (key === "ArrowLeft") moveLeft();
    else if (key === "ArrowRight") moveRight();
    else if (key === "ArrowUp") rotate();
});

document.body.addEventListener("click", () => {
    isPaused = !isPaused;
    renderGame();
});

startGameLoop();
