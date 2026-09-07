import { getTodayString } from '../lib/dates'

type Props = {
  currentDate: string
  onShiftDate: (delta: number) => void
  onChangeDate: (date: string) => void
}

export default function DateNav({ currentDate, onShiftDate, onChangeDate }: Props) {
  return (
    <div className="date-nav-container">
      <button onClick={() => onShiftDate(-1)}>←</button>
      <input type="date" value={currentDate} max={getTodayString()} onChange={(e) => onChangeDate(e.target.value)}></input>
      <button onClick={() => onShiftDate(1)} disabled={currentDate >= getTodayString()}>→</button>
      <button onClick={() => onChangeDate(getTodayString())}>Today</button>
    </div>
  )
}
