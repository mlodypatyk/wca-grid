import { Share } from '@boxicons/react'
import type { GameState } from '../lib/share'

type Props = {
  gameState: GameState
  guessesRemaining: number
  showSolutions: boolean
  isFree: boolean
  onShare: () => void
  onGiveUp: () => void
  onToggleSolutions: () => void
  onNewGame: () => void
}

export default function ResultBox({ gameState, guessesRemaining, showSolutions, isFree, onShare, onGiveUp, onToggleSolutions, onNewGame }: Props) {
  return (
    <>
      {gameState == "ongoing" && <div className="ff-button-container"><button className="ff-button" onClick={onGiveUp}>Give up</button></div>}
      {gameState == "win" && <div className="result-box win">
        <p className="result-box-text">You won! With {guessesRemaining} {guessesRemaining == 1 ? "guess" : "guesses"} remaining. </p>
        <p>Share your result!</p>
        <button className="shareButton" onClick={onShare}><span className="buttonText">Share</span> <Share /></button>
      </div>}
      {gameState == "lose" && <div className="result-box lose">
        <p className="result-box-text">You lost 😞</p>
        <p>Share your result!</p>
        <button className="shareButton" onClick={onShare}><span className="buttonText">Share</span> <Share /></button>
      </div>}
      {gameState != "ongoing" && <p><button onClick={onToggleSolutions}>{showSolutions ? 'Hide solutions' : 'Show solutions'}</button>{isFree && <button className="resetButton" onClick={onNewGame}>New game</button>}</p>}
    </>
  )
}
