const cells = document.querySelectorAll('[data-cell]');
const P1_CLASS = 'p1';
const P2_CLASS = 'p2';
const titleElement = document.getElementById('title');
const messageElement = document.getElementById('message');
const p1ScoreElement = document.getElementById('p1-score');
const p2ScoreElement = document.getElementById('p2-score');
const winLineElement = document.getElementById('win-line');
let isP1Human = false; // Set 1'st player to human
let isP2Human = false; // Set 2'nd player to computer
let isP1Turn = true; // Variable to track whose turn it is to start
let P1Score = 0;
let P2Score = 0;
let listOfRandomNumberFromWeb = [];
const pvc_wait_time = 500;
const cvc_wait_time = 200;

// This starts the game, and then, each time
// it starts the next game within the startGame function, recursively
// horrible, but it works
// there is some bug when going from CvC to PvC, probbaly because of the recursive call?

// Toggle buttons
const p1ModeToggle = document.getElementById('p1-mode-toggle');
const p2ModeToggle = document.getElementById('p2-mode-toggle');


p1ModeToggle.textContent = isP1Human ? 'P1: Human' : 'P1: Computer';
p1ModeToggle.addEventListener('click', () => {
    isP1Human = !isP1Human;
    p1ModeToggle.textContent = isP1Human ? 'P1: Human' : 'P1: Computer';
    resetScoreboard();
    startGame();
});


p2ModeToggle.textContent = isP2Human ? 'P2: Human' : 'P2: Computer';
p2ModeToggle.addEventListener('click', () => {
    isP2Human = !isP2Human;
    p2ModeToggle.textContent = isP2Human ? 'P2: Human' : 'P2: Computer';
    resetScoreboard();
    startGame();
});



function startGame() {
    disableClicks();
    messageElement.textContent = `${isP1Turn ? "🐧" : "🦈"} goes first!`; // Indicate who goes first
    winLineElement.style.width = '0'; // Clear the win line
    cells.forEach(cell => { // Clear the board
        cell.classList.remove(P1_CLASS);
        cell.classList.remove(P2_CLASS);
    });
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
    console.log(listOfRandomNumberFromWeb.length)
    const randomCell = availableCells[Math.floor(randomNumberFromWeb() * availableCells.length)];
    placeMark(randomCell, currentClass);
    if (checkEndGame(currentClass)) return;
    swapTurns();
}


function randomNumberFromWeb() {
    const minNum = parseInt($('.dice-ajax-form input[name="min_num"]').val(), 10);
    const maxNum = parseInt($('.dice-ajax-form input[name="max_num"]').val(), 10);
    if (listOfRandomNumberFromWeb.length > 0) {
        Qn = true
        myRandomNumber = (listOfRandomNumberFromWeb.pop()-minNum)/(maxNum-minNum);
    } else {
        Qn = false
        myRandomNumber = Math.random();
    }
    titleElement.textContent = `${Qn ? 'q' : ''}🎲 ${myRandomNumber}`;
    return myRandomNumber;
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


jQuery(document).ready(function($) {
    $('.dice-ajax-form').on('submit', function(e) {
        e.preventDefault();
        // send the ajax request, populate the list of random numbers
        sendAjaxRequest().then((data) => {
            listOfRandomNumberFromWeb = data.flat();
        }).catch((err) => {
            console.log(err);
        });
    });
});


function sendAjaxRequest() {
    var $form = $('.dice-ajax-form');
    proxy = 'https://cors-anywhere.herokuapp.com/';
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: proxy + $form.attr('action'),
            // url: $form.attr('action'),
            data: $form.serialize(),
            dataType: 'json',
            success: function(data) {
                var obj = JSON.parse(data);
                if (obj.type == "success") {
                    console.log("Your quantum random numbers are:<br/>");
                    console.log(obj.output);
                    resolve(obj.output);
                } else {
                    console.log(obj.message);
                    reject(obj.message);
                }
            },
            error: function(err) {
                reject(err);
            }
        });
    });
}


window.addEventListener('resize', resizeBoard);
Math.seedrandom(Date.now());
startGame();
resizeBoard(); // Call resizeBoard when the game starts
