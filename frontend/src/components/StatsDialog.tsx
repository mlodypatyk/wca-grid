import { useMemo } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { computeStats } from '../lib/stats'

type Props = {
  open: boolean
  onClose: () => void
}

export default function StatsDialog({ open, onClose }: Props) {
  const stats = useMemo(() => (open ? computeStats() : null), [open])

  return (
    <Dialog open={open} onClose={onClose} className="dialog-wrapper">
      <div className="dialog-backdrop" />
      <div className="dialog-container">
        <DialogPanel className="dialog-panel">
          <div className="info-scrollable">
            <p className="info-header"><b>Your stats</b></p>
            {stats === null ? null : <>
              <p className="info-description"><b>Win streak: </b>{stats.winStreak}</p>
              <p className="info-description"><b>Dailies played: </b>{stats.dailiesPlayed}</p>
              <p className="info-description"><b>Win percentage: </b>{stats.winPercentage}%</p>
            </>}
            <div className="ff-button-container"><button className="ff-button" onClick={onClose}>Close</button></div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
