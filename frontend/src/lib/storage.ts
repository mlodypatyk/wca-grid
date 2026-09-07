import type { Grid, GridState } from '../types'
import { getTodayString } from './dates'

export const getInitialDailyState = (): { grid: Grid; gridState: GridState; guessesRemaining: number } | null => {
  const saved = localStorage.getItem(`daily_state_${getTodayString()}`);
  return saved !== null ? JSON.parse(saved) : null;
}

export const saveStateToLocalStorage = function (
  mode: 'daily' | 'free',
  currentDate: string,
  grid: Grid,
  gridState: GridState,
  guessesRemaining: number,
) {
  if (mode === 'daily') {
    localStorage.setItem(`daily_state_${currentDate}`, JSON.stringify({ grid, gridState, guessesRemaining }));
  } else {
    localStorage.setItem("free_grid", JSON.stringify(grid))
    localStorage.setItem("free_gridState", JSON.stringify(gridState))
    localStorage.setItem("free_guesses", guessesRemaining.toString())
  }
}
