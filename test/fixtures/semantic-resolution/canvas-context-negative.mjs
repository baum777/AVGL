export function drawSnakeBoard(board, color, x, y, cellSize, inset) {
  const context = board.getContext('2d');
  context.fillStyle = color;
  context.fillRect(
    x * cellSize + inset,
    y * cellSize + inset,
    cellSize - inset * 2,
    cellSize - inset * 2
  );
}
