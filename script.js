const Gameboard = () => {
    const cells = [];
    for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            row.push(Cell());
        }
        cells.push(row);
    }

    const placeMarker = (player, row, column) => {
        if (cells[row][column].getValue() === 0) {
            cells[row][column].setValue(player.number);
        } else {
            console.log('error: cannot overwrite cell that has already been marked!')
        }
        
    }

    const getCellValue = (i, j) => {
        return cells[i][j].getValue();
    }

    const printBoard = () => {
        for (let i = 0; i < 3; i++) {
            console.log('\n');
            for (let j = 0; j < 3; j++) {
                console.log(getCellValue(i,j));
            }
        }
    }

    const gameWon = () => {

        const allEqual = (element, index, array) => element != 0 && element === array[0];

        //check all rows
        for (arr of cells) {
            let row = arr.map((element) => element.getValue())
            if (row.every(allEqual)) {
                return true;
            }
        }
        //check all columns
        for (let i = 0; i < 3; i++) {
            let col = [getCellValue(0,i), getCellValue(1,i), getCellValue(2,i)];
            if (col.every(allEqual)) {
                return true;
            }
        }
        // check diagonals
        const diag1 = [getCellValue(0,0), getCellValue(1,1), getCellValue(2,2)];
        if (diag1.every(allEqual)) {
            return true;
        }
        const diag2 = [getCellValue(0,2), getCellValue(1,1), getCellValue(2,0)];
        if (diag2.every(allEqual)) {
            return true;
        } else {
            return false;
        }
    }

    const isTie = () => {
        if (gameWon === true) {
            return false;
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (cells[i][j].getValue() === 0) {
                    return false;
                };
            }
        }
        return true;
    }

    const clearBoard = () => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells[i][j].setValue(0);
            }
        }
    }

    return {getCellValue, placeMarker, printBoard, gameWon, clearBoard, isTie};

}

const Cell = () => {
    let value = 0;

    const setValue = (number) => {
        value = number;
    }
    const getValue = () => value;

    return {getValue, setValue, value};
}

const Player = (name, number) => {
    let score = 0;

    const givePoint = () => score = score + 1;
    const getScore = () => score;
    return {name, number, getScore, givePoint};
}

const Game = (player1, player2) => {
    let activePlayer = player1;
    const board = Gameboard();

    const isTie = () => board.isTie();
    const gameWon = () => board.gameWon();
    const getCellValue = (i, j) => board.getCellValue(i, j);

    const resetGame = () => {
        board.clearBoard()
        activePlayer = player1;
    }

    const switchActivePlayer = () => {
        if (activePlayer === player1) {
            activePlayer = player2;
        } else {
            activePlayer = player1;
        }
    }

    const getActivePlayer = () => activePlayer;

    const makeMove = (row, column) => {
        board.placeMarker(activePlayer, row, column);

        if (gameWon()) {
            activePlayer.givePoint();
        } else if (isTie()) {
            //TODO
        } else {
            switchActivePlayer();
        }
    }

    return {makeMove, player1, player2, getActivePlayer, isTie, gameWon, resetGame, getCellValue};
}

const ScreenController = (function () {
    this.game = undefined;
    this.gameMessageIntervalId = undefined;

    const startGameButton = document.getElementById('start-game-button');
    const boardContainer = document.getElementById('board-container');
    const player1Score = document.getElementById("player-1-score");
    const player2Score = document.getElementById("player-2-score");
    const gameMessage = document.getElementById("game-message");
    const playAgainButton = document.getElementById("play-again-button");

    const startGame = () => {
        const player1Name = document.getElementById("player-1-name").value;
        const player2Name = document.getElementById("player-2-name").value;

        if (player1Name === '' && player2Name === '') {
            printStringByCharacter(
                string='Please enter names for player 1 and player 2!',
                element=gameMessage
            );
            return;
        } else if (player1Name === '') {
            printStringByCharacter(
                string='Please enter a name for player 1!',
                element=gameMessage
            );
            return;
        } else if (player2Name === '') {
            printStringByCharacter(
                string='Please enter a name for player 2!',
                element=gameMessage
            );
            return;
        }
        const player1 = Player(player1Name, 1);
        const player2 = Player(player2Name, 2);

        this.game = Game(player1, player2);

        goToGameScreen();
    }
    // adapted from Aayushpatniya: https://medium.com/@aayushpatniya1999/how-to-create-a-typing-effect-for-displaying-text-on-a-webpage-771b69440b61
    function printStringByCharacter(string='', element, interval=40) {
        // Prints the string one character at a time into the text content of element.
        // It waits interval number of ms between each letter.

        //clear contents of element
        element.textContent='';
        //stop previous instance of this function so there is no overlap
        if (this.gameMessageIntervalId != undefined) {
            clearInterval(this.gameMessageIntervalId);
        }
        let index = 0;
        const intervalId = setInterval(function() {
            element.textContent += string.charAt(index);
            index++;
            if (index == string.length) {
                clearInterval(intervalId);
            }
        }, interval);
        this.gameMessageIntervalId = intervalId;
    }

    startGameButton.addEventListener("click", startGame);

    const goToGameScreen = () => {
        const gameScreenElements = document.getElementsByClassName("game-screen");
        const openingScreenElements = document.getElementsByClassName("opening-screen");

        //hide opening screen elements
        for  (element of openingScreenElements) {
            if (element.classList.contains("togglable-grid")) {
                element.classList.add("inactive");
                element.classList.remove("active-grid");
            }
            else if (element.classList.contains("togglable-block")) {
                element.classList.add("inactive");
                element.classList.remove("active-block");
            }
        }

        renderBoard();

        //show game screen elements
        for (element of gameScreenElements) {
            if (element.classList.contains("togglable-grid")) {
                element.classList.remove("inactive");
                element.classList.add("active-grid");
            }
            else if (element.classList.contains("togglable-block")) {
                element.classList.remove("inactive");
                element.classList.add("active-block");
            }
        }
    }

    const runMakeMove = (event) => {
        this.game.makeMove(event.target.row, event.target.col);
        renderBoard(this.game);

        if (this.game.gameWon()) {
            printStringByCharacter(
                string = `${this.game.getActivePlayer().name} is the winner! They get 1 point!`,
                element = gameMessage);

            //disable all cells
            const cells = document.getElementsByClassName("cell");
                for (c of cells) {
                    c.disabled = true;
                }
                boardContainer.classList.add("darkened");
                playAgainButton.classList.remove("inactive");
                playAgainButton.classList.add("active-block");
        }

        if (this.game.isTie()) {
            printStringByCharacter(
                string="It's a tie!",
                element=gameMessage
            );
            boardContainer.classList.add("darkened");
            playAgainButton.classList.remove("inactive");
            playAgainButton.classList.add("active-block");
        }
    }

    const renderBoard = () => {
        //empty board of current cells
        boardContainer.replaceChildren();

        //render each new cell
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement("button");
                cell.classList.add("cell");
                cell.row = i;
                cell.col = j;

                switch(this.game.getCellValue(i, j)) {
                    case 0:
                        cell.textContent = '';
                        cell.disabled = false;
                        break;
                    case 1:
                        cell.textContent = 'X';
                        cell.disabled = true;
                        break;
                    case 2:
                        cell.textContent = 'O';
                        cell.disabled = true;
                        break;
                    default:
                        cell.textContent = '';
                        cell.disabled = false;
                }

                cell.addEventListener("click", runMakeMove);
                boardContainer.appendChild(cell);
            }
        }

        //now update score
        player1Score.textContent = `${this.game.player1.name}'s Score : ${this.game.player1.getScore()}`;
        player2Score.textContent = `${this.game.player2.name}'s Score : ${this.game.player2.getScore()}`;
        if (this.game.gameWon() === false && this.game.isTie() === false) {
            printStringByCharacter(
                string = `It is ${this.game.getActivePlayer().name}'s Turn`,
                element=gameMessage
            );
        }
        
    }

    const newRound = () => {
        this.game.resetGame();
        playAgainButton.classList.remove("active-block");
        playAgainButton.classList.add("inactive");
        boardContainer.classList.remove("darkened");
        renderBoard();
    }

    playAgainButton.addEventListener("click", newRound);

    printStringByCharacter(
        string="Please enter your names and press Start Game!",
        element=gameMessage
    );
})();