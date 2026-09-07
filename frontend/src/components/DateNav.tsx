import { getYesterdayString, puzzleNumberForDate, REFERENCE_DATE } from '../lib/dates'

type Props = {
  currentDate: string
  onShiftDate: (delta: number) => void
  onChangeDate: (date: string) => void
}

export default function DateNav({ currentDate, onShiftDate}: Props) {
  const puzzleNumber = puzzleNumberForDate(currentDate)
  const isEarliest = currentDate <= REFERENCE_DATE
  const isLatest = currentDate >= getYesterdayString()
  return (
    <div className="date-nav-container">
      <button onClick={() => onShiftDate(-1)} disabled={isEarliest}>←</button>
      <div className="puzzle-number">#{puzzleNumber}</div>
      <button onClick={() => onShiftDate(1)} disabled={isLatest}>→</button>
    </div>
  )
}
