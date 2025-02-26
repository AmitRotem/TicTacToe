const cells = document.querySelectorAll('[data-cell]');
const P1_CLASS = 'p1';
const P2_CLASS = 'p2';
const titleElement = document.getElementById('title');
const messageElement = document.getElementById('message');
const p1ScoreElement = document.getElementById('p1-score');
const p2ScoreElement = document.getElementById('p2-score');
const winLineElement = document.getElementById('win-line');
let isP1Human = true; // Set 1'st player to human
let isP2Human = false; // Set 2'nd player to computer
let isP1Turn = true; // Variable to track whose turn it is to start
let P1Score = 0;
let P2Score = 0;
const pvc_wait_time = 500;
const cvc_wait_time = 200;


// Toggle buttons
const p1ModeToggle = document.getElementById('p1-mode-toggle');
const p2ModeToggle = document.getElementById('p2-mode-toggle');


p1ModeToggle.textContent = isP1Human ? 'P1: Human' : 'P1: Computer';
p1ModeToggle.addEventListener('click', () => {
    isP1Human = !isP1Human;
    p1ModeToggle.textContent = isP1Human ? 'P1: Human' : 'P1: Computer';
    resetScoreboard();
    reStartGame();
});


p2ModeToggle.textContent = isP2Human ? 'P2: Human' : 'P2: Computer';
p2ModeToggle.addEventListener('click', () => {
    isP2Human = !isP2Human;
    p2ModeToggle.textContent = isP2Human ? 'P2: Human' : 'P2: Computer';
    resetScoreboard();
    reStartGame();
});


function reStartGame() {
    disableClicks();
    let board = document.querySelector('.board');
    // transition the board and cells to a rotated position
    cells.forEach(cell => {
        cell.style.transition = 'transform 1.5s';
        cell.style.transform = 'rotate(270deg)';
    });
    board.style.transition = 'transform 1.5s';
    board.style.transform = 'rotate(90deg)';
    clearBoard();
    // when the transition ends, clear the board, and rotate back
    board.addEventListener('transitionend', () => {
        board.style.transition = 'transform 0.0s';
        board.style.transform = 'rotate(0deg)';
        cells.forEach(cell => {
            cell.style.transition = 'transform 0.0s';
            cell.style.transform = 'rotate(0deg)';
        });
        startGame();
    }, { once: true });
}


function clearBoard() {
    disableClicks();
    cells.forEach(cell => { // Clear the board
        cell.classList.remove(P1_CLASS);
        cell.classList.remove(P2_CLASS);
    });
    winLineElement.style.width = '0'; // Clear the win line
}


function startGame() {
    clearBoard();
    messageElement.textContent = `${isP1Turn ? "🐧" : "🦈"} goes first!`; // Indicate who goes first
    nextTurn();
}


function nextTurn() {
    if ((isP1Turn && isP1Human) || (!isP1Turn && isP2Human))  { // Human player's turn
        enableClicks();
    } else { // Computer player's turn
        setTimeout(computerMove, (isP1Human || isP2Human) ? pvc_wait_time : cvc_wait_time); // Add a 500ms delay before the computer moves
    }
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


function handleClick(e) {
    const cell = e.target;
    if (cell.classList.contains(P1_CLASS) || cell.classList.contains(P2_CLASS)) {
        return; // If the cell is already occupied, do nothing
    }
    disableClicks();
    const currentClass = isP1Turn ? P1_CLASS : P2_CLASS;
    placeMark(cell, currentClass);
    if (checkEndGame(currentClass)) {return;} else {swapTurns();}
}


function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}


function checkEndGame(currentClass) {
    if (checkWin(currentClass)) {
        messageElement.textContent = `${isP1Turn ? "🐧" : "🦈"} Wins!`;
        updateScoreboard(currentClass);
        drawWinLine(checkWin(currentClass));
        isP1Turn = !isP1Turn;
        setTimeout(startGame, (isP1Human || isP2Human) ? 2*pvc_wait_time : 2*cvc_wait_time); // Add a 1s delay before starting the next game
        return true;
    } else if (isDraw()) {
        messageElement.textContent = 'Draw!';
        isP1Turn = !isP1Turn;
        setTimeout(startGame, (isP1Human || isP2Human) ? 2*pvc_wait_time : 2*cvc_wait_time);
        return true;
    }
    return false;
}


function swapTurns() {
    isP1Turn = !isP1Turn;
    messageElement.textContent = `${isP1Turn ? "🐧" : "🦈"}'s turn!`;
    nextTurn();
}


function checkWin(myClass) {
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
            return cells[index].classList.contains(myClass);
        });
    });
}


function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(P1_CLASS) || cell.classList.contains(P2_CLASS);
    });
}


function computerMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(P1_CLASS) && !cell.classList.contains(P2_CLASS);
    });
    // Check if the computer can win in the next move
    const currentClass = isP1Turn ? P1_CLASS : P2_CLASS;
    for (let cell of availableCells) {
        cell.classList.add(currentClass);
        if (checkWin(currentClass)) {
            placeMark(cell, currentClass);
            checkEndGame(currentClass);
            return;
        }
        cell.classList.remove(currentClass);
    }
    
    
    // Check if the opponent can win in the next move and block
    const otherClass = !isP1Turn ? P1_CLASS : P2_CLASS;
    for (let cell of availableCells) {
        cell.classList.add(otherClass);
        if (checkWin(otherClass)) {
            cell.classList.remove(otherClass);
            placeMark(cell, currentClass);
            if (checkEndGame(currentClass)) return;
            swapTurns();
            return;
        }
        cell.classList.remove(otherClass);
    }

    // If no immediate win or block, choose a random cell
    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    placeMark(randomCell, currentClass);
    if (checkEndGame(currentClass)) return;
    swapTurns();
}


function updateScoreboard(winner) {
    if (winner === P1_CLASS) {
        P1Score++;
        p1ScoreElement.textContent = P1Score;
    } else if (winner === P2_CLASS) {
        P2Score++;
        p2ScoreElement.textContent = P2Score;
    }
    return;
}

function resetScoreboard() {
    P1Score = 0;
    P2Score = 0;
    p1ScoreElement.textContent = 0;
    p2ScoreElement.textContent = 0;
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

    const x1 = startRect.left + startRect.width / 2;
    const y1 = startRect.top + startRect.height / 2;
    const x2 = endRect.left + endRect.width / 2;
    const y2 = endRect.top + endRect.height / 2;
    
    const length = Math.hypot(x2 - x1 , y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    winLineElement.style.width = `${length}px`;
    winLineElement.style.transform = `rotate(${angle}rad)`;
    winLineElement.style.left = `${x1}px`;
    winLineElement.style.top = `${y1}px`;
}


window.addEventListener('resize', resizeBoard);
Math.seedrandom(Date.now());
startGame();
resizeBoard(); // Call resizeBoard when the game starts
