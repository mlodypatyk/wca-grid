import { useEffect, useState } from 'react'

const getTimeUntilMidnight = (): number => {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':')
}

export default function Countdown() {
  const [remaining, setRemaining] = useState<number>(getTimeUntilMidnight)

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getTimeUntilMidnight()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="countdown-container">
      Next daily in {formatDuration(remaining)}
    </div>
  )
}
