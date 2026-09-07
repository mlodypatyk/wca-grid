import type { Grid, GridState } from '../types'

export type GameState = 'win' | 'lose' | 'ongoing'

export const buildShareText = function (
  mode: 'daily' | 'free' | 'previous',
  grid: Grid,
  gridState: GridState,
  guessesRemaining: number,
  gameState: GameState,
): string {
  let finalText = ''
  if (mode !== 'free') {
    finalText += `Daily #${grid.number}\n`
  }
  if (gameState == "win") {
    finalText += `${guessesRemaining} guesses remaining\n`
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (gridState.state[i][j].state == null) {
        finalText += '❌'
      } else {
        finalText += '✅'
      }
    }
    finalText += '\n'
  }
  if (grid.seed) {
    finalText += `Try your skills at: ${import.meta.env.VITE_FRONTEND_URL}/?seed=${grid.seed}\n`
  } else {
    finalText += `Try your skills at: ${import.meta.env.VITE_FRONTEND_URL}\n`
  }
  return finalText
}
