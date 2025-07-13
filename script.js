const boardDiv = document.getElementById("board");
const solveBtn  = document.getElementById("solveBtn");
const clearBtn  = document.getElementById("clearBtn");
const msgP      = document.getElementById("msg");

const SIZE = 9;
let inputs = [];

window.onload = () => {
  for (let r = 0; r < SIZE; r++) {
    inputs[r] = [];
    for (let c = 0; c < SIZE; c++) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 1;

      inp.addEventListener("input", e => {
        const v = e.target.value;
        if (!/^[1-9]$/.test(v)) e.target.value = "";
        e.target.classList.toggle("filled", v !== "");
      });

      boardDiv.appendChild(inp);
      inputs[r][c] = inp;
    }
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      board[r][c] = parseInt(inputs[r][c].value) || 0;
  return board;
}

function setBoard(board) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      inputs[r][c].value = board[r][c] || "";
      inputs[r][c].classList.add("solved");
    }
}

function clearBoard() {
  inputs.flat().forEach(i => {
    i.value = "";
    i.classList.remove("filled", "solved", "invalid", "solving");
  });
  msg("");
}

clearBtn.onclick = clearBoard;

solveBtn.onclick = async () => {
  msg("");
  clearHighlights();
  const board = getBoard();

  if (!isValidBoard(board)) {
    msg("Invalid input — duplicates in row/col/box!", false);
    markInvalid(board);
    return;
  }

  const solved = await solve(board);
  if (solved) {
    msg("Solved ✨", true);
  } else {
    msg("No solution found!", false);
  }
};

async function solve(board, r = 0, c = 0) {
  if (r === SIZE) return true;
  if (c === SIZE) return await solve(board, r + 1, 0);
  if (board[r][c] !== 0) return await solve(board, r, c + 1);

  for (let num = 1; num <= 9; num++) {
    if (isSafe(board, r, c, num)) {
      board[r][c] = num;
      inputs[r][c].value = num;
      inputs[r][c].classList.add("solving");
      await sleep(70);

      if (await solve(board, r, c + 1)) return true;

      board[r][c] = 0;
      inputs[r][c].value = "";
      inputs[r][c].classList.remove("solving");
      await sleep(70);
    }
  }

  return false;
}

function isSafe(b, row, col, val) {
  for (let i = 0; i < SIZE; i++) {
    if (b[row][i] === val || b[i][col] === val) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (b[boxRow + r][boxCol + c] === val) return false;

  return true;
}

function isValidBoard(b) {
  const seenRow = new Set(), seenCol = new Set(), seenBox = new Set();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = b[r][c];
      if (val === 0) continue;
      const rowK = `r${r}-${val}`, colK = `c${c}-${val}`, boxK = `b${Math.floor(r/3)}${Math.floor(c/3)}-${val}`;
      if (seenRow.has(rowK) || seenCol.has(colK) || seenBox.has(boxK)) return false;
      seenRow.add(rowK); seenCol.add(colK); seenBox.add(boxK);
    }
  }
  return true;
}

function markInvalid(b) {
  inputs.flat().forEach(i => i.classList.remove("invalid"));
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (b[r][c] && !isSafe(b, r, c, b[r][c]))
        inputs[r][c].classList.add("invalid");
}

function msg(text, ok = true) {
  msgP.textContent = text;
  msgP.className = "msg " + (ok ? "ok" : "err");
}

function clearHighlights() {
  inputs.flat().forEach(i => i.classList.remove("solving"));
}
