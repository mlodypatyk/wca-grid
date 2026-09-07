type Props = {
  mode: 'daily' | 'free' | 'previous'
  onSwitch: (mode: 'daily' | 'free' | 'previous') => void
  disablePrevious : boolean
}

export default function ModeToggle({ mode, onSwitch, disablePrevious: disableFreePlay }: Props) {
  return (
    <div className="mode-toggle-container">
      <button className={mode === 'daily' ? 'mode-toggle active' : 'mode-toggle'} onClick={() => onSwitch('daily')}>Daily</button>
      <button className={mode === 'free' ? 'mode-toggle active' : 'mode-toggle'} onClick={() => onSwitch('free')}>Free play</button>
      <button className={mode === 'previous' ? 'mode-toggle active' : 'mode-toggle'} onClick={() => onSwitch('previous')} disabled = {disableFreePlay}>Previous daily grids</button>
    </div>
  )
}
