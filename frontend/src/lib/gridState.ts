import type { GridState } from '../types'

export const makeDefaultGridState = (): GridState => ({
  state: [
    [{state: null, guessRating: null}, {state: null, guessRating: null}, {state: null, guessRating: null}],
    [{state: null, guessRating: null}, {state: null, guessRating: null}, {state: null, guessRating: null}],
    [{state: null, guessRating: null}, {state: null, guessRating: null}, {state: null, guessRating: null}],
  ]
})
