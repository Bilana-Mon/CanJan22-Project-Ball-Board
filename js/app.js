var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';
var gInterval = null;
var gInterval2 = null;
var gCounter;
var gIsGlued = false;

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/candy.png" />';

var gBoard;
var gGamerPos;

function init() {
	gGamerPos = { i: 2, j: 9 };
	document.querySelector('h1').innerText = 'Collect those Balls';
	gCounter = 0;
	gBoard = buildBoard();
	renderBoard(gBoard)
	gInterval = setInterval(addBall, 4000, gBoard);
	gInterval2 = setInterval(addGlue, 5000, gBoard);

}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12);

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				if (i === 0 && j === 6 || i === 5 && j === 0 || i === 9 && j === 6 || i === 5 && j === 11) cell.type = FLOOR;
				else cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;

		}
	}




	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;


	return board;
}

function emptyCells() {
	var array = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			if (cell.gameElement === null && cell.type !== WALL) {
				array.push({ i: i, j: j });
			}
		}
	}
	return array;
}


function randCoord(array) {
	var obj = [];
	for (var i = 0; i < array.length; i++) {
		obj = array[Math.floor(Math.random() * array.length)];
	}
	return obj;
}

function addBall(board) {
	var array = emptyCells();
	var obj = randCoord(array);
	board[obj.i][obj.j].gameElement = BALL;

	renderCell(obj, BALL_IMG);
}



function addGlue(board) {

	var array = emptyCells();
	var obj = randCoord(array);
	board[obj.i][obj.j].gameElement = GLUE;

	renderCell(obj, GLUE_IMG);
	setTimeout(function () {
		if (board[obj.i][obj.j].gameElement === GLUE) {
			board[obj.i][obj.j].gameElement = null;
			renderCell(obj, '');
		}
	}, 3000);
}




// Render the board to an HTML table
function renderBoard(board) {


	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';


			strHTML += `\t<td class="gamer cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;


			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;
	if (gIsGlued) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		gGamerPos.j === 0 ||
		gGamerPos.j === 11 ||
		gGamerPos.i === 0 ||
		gGamerPos.i === 9) {

		if (targetCell.gameElement === BALL) {
			var audio = new Audio('sound/mixkit-domestic-cat-hungry-meow-45.wav')
			audio.play();
			console.log('Collecting!');
			gCounter++
			var elCounter = document.querySelector('.counter');
			elCounter.innerText = 'Balls Collected: ' + gCounter;
		}

		if (targetCell.gameElement === GLUE) {
			gIsGlued = true;
			setTimeout(function () {
				gIsGlued = false;
			}, 3000);
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	}

	if (!gameOver(gBoard)) {
		clearInterval(gInterval);
		clearInterval(gInterval2);
		var elH1 = document.querySelector('h1');
		elH1.innerText = 'Victory!';
		var elDiv = document.querySelector('.game-over');
		elDiv.innerHTML = '<button onclick="init(this)">New Game?</button>';
	}

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) {
				moveTo(5, 11);
			} else {
				moveTo(i, j - 1);
			}
			break;
		case 'ArrowRight':
			if (j === 11) {
				moveTo(5, 0);
			} else {
				moveTo(i, j + 1);
			}
			break;
		case 'ArrowUp':
			if (i === 0) {
				moveTo(9, 6);
			} else {
				moveTo(i - 1, j);
			}
			break;
		case 'ArrowDown':
			if (i === 9) {
				moveTo(0, 6);
			} else {
				moveTo(i + 1, j);
			}
			break;
	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function gameOver(board) {
	var counter = 0;
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (board[i][j].gameElement === BALL) {
				counter++;
			}
		}
	}
	return counter;
}


