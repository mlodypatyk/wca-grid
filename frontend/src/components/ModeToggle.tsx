type Props = {
  mode: 'daily' | 'free'
  onSwitch: (mode: 'daily' | 'free') => void
}

export default function ModeToggle({ mode, onSwitch }: Props) {
  return (
    <div className="mode-toggle-container">
      <button className={mode === 'daily' ? 'mode-toggle active' : 'mode-toggle'} onClick={() => onSwitch('daily')}>Daily</button>
      <button className={mode === 'free' ? 'mode-toggle active' : 'mode-toggle'} onClick={() => onSwitch('free')}>Free play</button>
    </div>
  )
}
