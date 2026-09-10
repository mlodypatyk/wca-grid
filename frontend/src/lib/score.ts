import type { GridState } from '../types'

export const computeScore = function (gridState: GridState): number {
  let score = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const rating = gridState.state[i][j].guessRating
      score += (rating ?? 1) * 100
    }
  }
  return Math.round(score)
}
