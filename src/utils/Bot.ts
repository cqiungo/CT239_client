export function bestMove(piles: number[]) {
  const nimSum = piles.reduce((a, b) => a ^ b, 0)

  if (nimSum === 0) {
    // Không có nước đi thắng -> chọn bừa
    const row = piles.findIndex((p) => p > 0)
    return row >= 0 ? { pileIndex: row, take: 1 } : null
  }

  for (let i = 0; i < piles.length; i++) {
    const target = piles[i] ^ nimSum
    if (target < piles[i]) {
      return { pileIndex: i, take: piles[i] - target }
    }
  }

  return null
}
