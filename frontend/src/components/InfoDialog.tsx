import { Dialog, DialogPanel } from '@headlessui/react'

type Props = {
  open: boolean
  onClose: () => void
}

export default function InfoDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="dialog-wrapper">
      <div className="dialog-backdrop" />
      <div className="dialog-container">
        <DialogPanel className="dialog-panel">
          <div className="info-scrollable">
            <p className="info-header"><b>How to play?</b></p>
            <p className="info-description">For each square, guess a person that fulfills both the vertical and horizontal criteria. Once you guess someone, you cannot reuse them for the entire grid.</p>
            <p className="info-header"><b>Categories</b></p>
            <p className="info-description"><b>Event sub-X: </b>all people who are subX in an event, average for all sighted events, and single for all blind events.</p>
            <p className="info-description"><b>World championship podium: </b>all people who podiumed at any world championship</p>
            <p className="info-description"><b>Continental championship podium: </b>all people from said continent who have a continental title (e.g., Patrick Ponce does not count for Europe, despite coming first in 3x3 at Euroes 2022).</p>
            <p className="info-description"><b>X+ comps:</b> people who went to more than X comps</p>
            <p className="info-description"><b>Represents country:</b> people who represent a country or represented a country in the past</p>
            <p className="info-description"><b>Held record:</b> people who held a particular type of record, doesn't count down (e.g., a WR is not an NR).</p>
            <p className="info-header"><b>Data ownership disclaimer</b></p>
            <p className="info-description"> This information is based on competition results owned and maintained by the World Cube Assocation, published at https://worldcubeassociation.org/results as of March 21, 2026.</p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
