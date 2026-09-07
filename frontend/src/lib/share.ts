import type { Grid, GridState } from '../types'
import { shuffleArray } from '../shuffleArray'
import { getReadableCategoryName } from './categories'

export type GameState = 'win' | 'lose' | 'ongoing'

export const buildShareText = function (
  mode: 'daily' | 'free',
  grid: Grid,
  gridState: GridState,
  guessesRemaining: number,
  gameState: GameState,
): string {
  let finalText = ''
  if (mode === 'daily') {
    finalText += `Daily #${grid.number}\n`
    if(gameState == "win"){
      finalText += `${guessesRemaining} guesses remaining\n`
    }
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        if(gridState.state[i][j].state == null){
          finalText += '❌';
        }else{
          finalText += '✅';
        }
      }
      finalText += '\n'
    }
    finalText += 'Try your skills at: https://grid.shab.waw.pl\n'
  } else {
    const emojis = ['🦆', '🦄', '🐷', '🐤', '🦞', '🐯', '🐘', '🐍', '🐝', '🐳']
    const okay = '✅'
    const wrong = '❌'
    shuffleArray(emojis);
    if(gameState == "win"){
      finalText += `${guessesRemaining} guesses remaining\n`
    }

    finalText += '⬛'
    for(let i=0;i<3;i++){
      finalText+=emojis[i];
    }
    finalText += '\n'
    for(let i=0;i<3;i++){
      finalText += emojis[i+3];
      for(let j=0;j<3;j++){
        if(gridState.state[i][j].state == null){
          finalText += wrong;
        }else{
          finalText += okay;
        }
      }
      finalText += '\n'
    }
    finalText += '\n';
    for(let i=0;i<3;i++){
      finalText += emojis[i];
      finalText += ': '
      finalText += getReadableCategoryName(grid.v[i])
      finalText += '\n'
    }
    for(let i=0;i<3;i++){
      finalText += emojis[i+3];
      finalText += ': '
      finalText += getReadableCategoryName(grid.h[i])
      finalText += '\n'
    }
    finalText += 'Try your skills at: https://grid.shab.waw.pl\n'
  }
  return finalText;
}
