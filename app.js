// File: app.js
var origBoard;
const huPlayer = 'X';
const aiPlayer = 'O'; // AI or Player 2
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const modeToggleButton = document.getElementById('mode-toggle-button');
const scoreDisplay = document.getElementById('score-display'); // Get score display div
const player1ScoreSpan = document.getElementById('player1-score'); // Get player 1 score span
const player2ScoreSpan = document.getElementById('player2-score'); // Get player 2 score span
const tieScoreSpan = document.getElementById('tie-score'); // Get tie score span


let currentMode = 'ai'; // 'ai' for Player vs AI, 'player' for Player vs Player
let currentPlayer = huPlayer; // Used in Player vs Player mode

// Add score variables
let player1Score = 0;
let player2Score = 0;
let tieScore = 0;


startGame();

modeToggleButton.addEventListener('click', toggleMode);

function toggleMode() {
    if (currentMode === 'ai') {
        currentMode = 'player';
        modeToggleButton.innerText = 'Chế độ: Chơi hai người';
        scoreDisplay.style.display = 'block'; // Show score display
    } else {
        currentMode = 'ai';
        modeToggleButton.innerText = 'Chế độ: Chơi với máy';
        scoreDisplay.style.display = 'none'; // Hide score display
    }
    startGame(); // Restart game with new mode
}

function startGame() {
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].removeEventListener('click', turnClick, false); // Remove existing listeners
        cells[i].addEventListener('click', turnClick, false); // Add new listeners
    }
    currentPlayer = huPlayer; // Reset current player for Player vs Player mode
     // Update score display at the start of a new game (in case mode changed)
    updateScoreDisplay();
}

function turnClick(box) {
    if (typeof origBoard[box.target.id] == 'number') {
        if (currentMode === 'ai') {
            // Player vs AI logic
            turn(box.target.id, huPlayer);
            if (!checkWin(origBoard, huPlayer) && !checkTie()) {
                turn(bestSpot(), aiPlayer);
            }
        } else {
            // Player vs Player logic
            turn(box.target.id, currentPlayer);
            if (!checkWin(origBoard, currentPlayer) && !checkTie()) {
                // Switch player
                currentPlayer = (currentPlayer === huPlayer) ? aiPlayer : huPlayer;
            }
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) {
        gameOver(gameWon);
    } else if (checkTie()) {
        // Tie is handled in checkTie, which calls declareWinner and updates score
    }
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        // Different colors for winning players
        document.getElementById(index).style.backgroundColor = gameWon.player == huPlayer ? "blue" : "red";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    // Update score based on winner
    if (gameWon.player === huPlayer) {
        player1Score++;
    } else {
        player2Score++;
    }
    updateScoreDisplay(); // Update display after score change

    // Declare winner based on mode and player
    let winnerText = "";
    if (currentMode === 'ai') {
        winnerText = gameWon.player == huPlayer ? "Bạn thắng!" : "Bạn thua...";
    } else {
        winnerText = gameWon.player == huPlayer ? "Người chơi 1 thắng!" : "Người chơi 2 thắng!";
    }
    declareWinner(winnerText);
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function checkTie() {
    // Check for tie only if there's no winner and the board is full
    if (emptySquares().length === 0 && !checkWin(origBoard, huPlayer) && !checkWin(origBoard, aiPlayer)) {
         for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        tieScore++; // Increment tie score
        updateScoreDisplay(); // Update display after score change
        declareWinner("Hòa!"); // Declare tie
        return true;
    }
    return false;
}

// Function to update the score display
function updateScoreDisplay() {
    player1ScoreSpan.innerText = `Người chơi 1 (O): ${player1Score}`;
    player2ScoreSpan.innerText = `Người chơi 2 (X): ${player2Score}`;
    tieScoreSpan.innerText = `Hòa: ${tieScore}`;
}


// AI functions (minimax) - only used in 'ai' mode
function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

function minimax(newBoard, player) {
    var availSpots = emptySquares();
    if (checkWin(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }
    var bestMove;
    if (player === aiPlayer) {
        var bestScore = -100000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}
