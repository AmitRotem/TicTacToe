const cells = document.querySelectorAll('[data-cell]');
const X_CLASS = 'x';
const O_CLASS = 'o';
const modeToggle = document.getElementById('mode-toggle');
const messageElement = document.getElementById('message');
const xScoreElement = document.getElementById('x-score');
const oScoreElement = document.getElementById('o-score');
const winLineElement = document.getElementById('win-line');
let oTurn;
let isPvC = true; // Set PvC as the default mode
let isHumanTurn = true; // Variable to track whose turn it is to start
let xScore = 0;
let oScore = 0;

modeToggle.textContent = isPvC ? 'Switch to PvP' : 'Switch to PvC'; // Update button text

modeToggle.addEventListener('click', () => {
    isPvC = !isPvC;
    modeToggle.textContent = isPvC ? 'Switch to PvP' : 'Switch to PvC';
    resetScoreboard();
    startGame();
});

window.addEventListener('resize', resizeBoard);

startGame();

function startGame() {
    oTurn = !isHumanTurn; // Set oTurn based on whose turn it is to start
    messageElement.textContent = ''; // Clear the message
    winLineElement.style.width = '0'; // Clear the win line
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });

    // If it's the computer's turn to start in PvC mode, make the first move
    if (isPvC && oTurn) {
        setTimeout(computerMove, 500); // Add a 500ms delay before the computer moves
    }
}

function handleClick(e) {
    const cell = e.target;
    if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
        return; // If the cell is already occupied, do nothing
    }
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        if (isPvC && oTurn) {
            disableClicks(); // Disable clicks during the computer's turn
            setTimeout(computerMove, 500); // Add a 500ms delay before the computer moves
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    oTurn = !oTurn;
}

function checkWin(currentClass) {
    const WINNING_COMBINATIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    return WINNING_COMBINATIONS.find(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw, currentClass) {
    if (draw) {
        messageElement.textContent = 'Draw!';
    } else {
        messageElement.textContent = `${oTurn ? "O's" : "X's"} Wins!`;
        updateScoreboard(currentClass);
        drawWinLine(checkWin(currentClass));
    }
    cells.forEach(cell => {
        cell.removeEventListener('click', handleClick); // Disable further clicks
    });
    isHumanTurn = !isHumanTurn; // Toggle the starting player for the next game
    setTimeout(startGame, 2000); // Add a delay before starting the next game
}

function computerMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    // Check if the computer can win in the next move
    for (let cell of availableCells) {
        cell.classList.add(O_CLASS);
        if (checkWin(O_CLASS)) {
            placeMark(cell, O_CLASS);
            endGame(false, O_CLASS);
            return;
        }
        cell.classList.remove(O_CLASS);
    }

    // Check if the human can win in the next move and block them
    for (let cell of availableCells) {
        cell.classList.add(X_CLASS);
        if (checkWin(X_CLASS)) {
            cell.classList.remove(X_CLASS);
            placeMark(cell, O_CLASS);
            if (checkWin(O_CLASS)) {
                endGame(false, O_CLASS);
            } else if (isDraw()) {
                endGame(true);
            } else {
                swapTurns();
                enableClicks(); // Re-enable clicks after the computer's turn
            }
            return;
        }
        cell.classList.remove(X_CLASS);
    }

    // If no immediate win or block, choose a random cell
    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    placeMark(randomCell, O_CLASS);
    if (checkWin(O_CLASS)) {
        endGame(false, O_CLASS);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        enableClicks(); // Re-enable clicks after the computer's turn
    }
}

function updateScoreboard(winner) {
    if (winner === X_CLASS) {
        xScore++;
        xScoreElement.textContent = xScore;
    } else if (winner === O_CLASS) {
        oScore++;
        oScoreElement.textContent = oScore;
    }
}

function resetScoreboard() {
    xScore = 0;
    oScore = 0;
    xScoreElement.textContent = xScore;
    oScoreElement.textContent = oScore;
}

function disableClicks() {
    cells.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
}

function enableClicks() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleClick, { once: true });
    });
}

function resizeBoard() {
    const board = document.querySelector('.board');
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
}

function drawWinLine(combination) {
    if (!combination) return;
    const [start, , end] = combination;
    const startCell = cells[start];
    const endCell = cells[end];
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();
    const boardRect = document.querySelector('.board').getBoundingClientRect();

    const x1 = startRect.left + startRect.width / 2 - boardRect.left;
    const y1 = startRect.top + startRect.height / 2 - boardRect.top;
    const x2 = endRect.left + endRect.width / 2 - boardRect.left;
    const y2 = endRect.top + endRect.height / 2 - boardRect.top;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2, x2) * (180 / Math.PI);

    winLineElement.style.width = `${length}px`;
    winLineElement.style.transform = `rotate(${angle}deg)`;
    winLineElement.style.left = `${x1}px`;
    winLineElement.style.top = `${y1}px`;
}