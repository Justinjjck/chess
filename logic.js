
let game;
let selected = null;
let playerIsWhite = true;
let moveHistory = [];
const boardElement = document.getElementById("chessboard");
const moveList = document.getElementById("moveList");

const pieceImages = {
  p: "b_pawn.png", r: "b_rook.png", n: "b_knight.png", b: "b_bishop.png", q: "b_queen.png", k: "b_king.png",
  P: "w_pawn.png", R: "w_rook.png", N: "w_knight.png", B: "w_bishop.png", Q: "w_queen.png", K: "w_king.png"
};

function startGame(isWhite) {
  playerIsWhite = isWhite;
  game = new Chess();
  moveHistory = [];
  document.getElementById("colorChoice").style.display = "none";
  boardElement.classList.remove("hidden");
  drawBoard();
  generateLabels();
}

function generateLabels() {
  const top = document.getElementById("topLabels");
  const left = document.getElementById("leftLabels");
  top.innerHTML = "";
  left.innerHTML = "";

  const files = playerIsWhite ? "abcdefgh" : "hgfedcba";
  const ranks = playerIsWhite ? [...Array(8).keys()].map(i => 8 - i) : [...Array(8).keys()].map(i => i + 1);

  for (let i = 0; i < 8; i++) {
    const fileLabel = document.createElement("div");
    fileLabel.textContent = files[i];
    top.appendChild(fileLabel);

    const rankLabel = document.createElement("div");
    rankLabel.textContent = ranks[i];
    left.appendChild(rankLabel);
  }
}

function drawBoard() {
  boardElement.innerHTML = "";
  const board = game.board();
  const rows = playerIsWhite ? board : board.slice().reverse();

  rows.forEach((row, y) => {
    const rowIdx = playerIsWhite ? y : 7 - y;
    const cells = playerIsWhite ? row : row.slice().reverse();
    cells.forEach((cell, x) => {
      const colIdx = playerIsWhite ? x : 7 - x;
      const square = document.createElement("div");
      square.className = "square " + ((rowIdx + colIdx) % 2 === 0 ? "white" : "black");
      square.dataset.x = colIdx;
      square.dataset.y = rowIdx;

      const squareName = coordsToSquare(colIdx, rowIdx);
      if (selected) {
        const moves = game.moves({ square: selected, verbose: true });
        if (moves.some(m => m.to === squareName)) {
          const point = document.createElement("div");
          point.className = "point";
          square.appendChild(point);
        }
      }

      if (cell) {
        const img = document.createElement("img");
        img.src = "images/" + pieceImages[cell.color === 'w' ? cell.type.toUpperCase() : cell.type];
        img.style.width = "100%";
        square.appendChild(img);
      }

      square.onclick = () => handleClick(colIdx, rowIdx);
      boardElement.appendChild(square);
    });
  });

  updateStatus();
  updateMoveList();
}

function handleClick(x, y) {
  const square = coordsToSquare(x, y);
  if (selected) {
    const move = game.move({ from: selected, to: square, promotion: "q" });
    if (move) {
      moveHistory.push(move.san);
      selected = null;
    } else {
      selected = square;
    }
  } else {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      selected = square;
    }
  }
  drawBoard();
}

function coordsToSquare(x, y) {
  const file = "abcdefgh"[x];
  const rank = 8 - y;
  return file + rank;
}

function updateStatus() {
  const status = document.getElementById("status");
  if (game.in_checkmate()) {
    status.textContent = "Schachmatt! " + (game.turn() === "w" ? "Schwarz" : "Weiß") + " gewinnt.";
  } else if (game.in_draw()) {
    status.textContent = "Unentschieden!";
  } else if (game.in_check()) {
    status.textContent = "Schach!";
  } else {
    status.textContent = (game.turn() === "w" ? "Weiß" : "Schwarz") + " ist am Zug.";
  }
}

function updateMoveList() {
  moveList.innerHTML = "<h3>Züge</h3>";
  for (let i = 0; i < moveHistory.length; i += 2) {
    const white = moveHistory[i] || "";
    const black = moveHistory[i + 1] || "";
    moveList.innerHTML += `<div>${(i / 2 + 1)}. ${white} ${black}</div>`;
  }
}
