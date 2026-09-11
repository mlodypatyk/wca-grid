import type { GridState } from '../types'
import type { GameState } from './share'

export const computeGameState = function (gridState: GridState, guessesRemaining: number): GameState {
  let isSolved = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (gridState.state[i][j].state == null) {
        isSolved = false;
      }
    }
  }
  if (isSolved) return "win";
  if (guessesRemaining == 0) return "lose";
  return "ongoing";
}

export type Stats = {
  dailiesPlayed: number
  wins: number
  winPercentage: number
  winStreak: number
}

export const computeStats = function (): Stats {
  const dailyStates: { date: string; state: GameState }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key == null || !key.startsWith('daily_state_')) continue
    const date = key.slice('daily_state_'.length)
    const saved = localStorage.getItem(key)
    if (saved == null) continue
    try {
      const { gridState, guessesRemaining } = JSON.parse(saved)
      dailyStates.push({ date, state: computeGameState(gridState, guessesRemaining) })
    } catch {
      continue
    }
  }
  dailyStates.sort((a, b) => a.date.localeCompare(b.date))

  const finishedDailies = dailyStates.filter((daily) => daily.state !== 'ongoing')
  const dailiesPlayed = finishedDailies.length
  const wins = finishedDailies.filter((daily) => daily.state === 'win').length
  const winPercentage = dailiesPlayed === 0 ? 0 : Math.round((100 * wins) / dailiesPlayed)

  let winStreak = 0
  for (let i = dailyStates.length - 1; i >= 0; i--) {
    if (dailyStates[i].state !== 'win') break
    winStreak++
  }

  return { dailiesPlayed, wins, winPercentage, winStreak }
}
