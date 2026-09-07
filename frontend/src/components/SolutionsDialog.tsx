import { Dialog, DialogPanel } from '@headlessui/react'
import type { Person } from '../wca_types'
import { noProfileIcon } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  solutionsPeople: string[]
  peopleData: Map<string, Person>
}

export default function SolutionsDialog({ open, onClose, solutionsPeople, peopleData }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="dialog-wrapper">
      <div className="dialog-backdrop" />
      <div className="dialog-container">
        <DialogPanel className="dialog-panel">
          <div className="solutions-scrollable">
            {solutionsPeople.map((person, i) => <div className="person-search-display" key={i}>
              <div className="avatar-container"><img className="image-tiny" src={peopleData.has(person) ? peopleData.get(person)!.avatar.thumb_url : noProfileIcon}></img></div>
              <a href={`https://www.worldcubeassociation.org/persons/${person}`} target="_blank">{peopleData.has(person) ? peopleData.get(person)!.name : person}</a>
            </div>)}
          </div>
          <p><button onClick={onClose}>Close</button></p>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
