import { Dialog, DialogPanel } from '@headlessui/react'
import type { Person } from '../wca_types'

type Props = {
  open: boolean
  onClose: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  searchLoading: boolean
  searchPeople: Person[]
  onSelect: (person: Person) => void
}

export default function PersonSearchDialog({ open, onClose, searchTerm, onSearchChange, searchLoading, searchPeople, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="dialog-wrapper">
      <div className="dialog-backdrop" />
      <div className="dialog-container">
        <DialogPanel className="dialog-panel">
          <input className="search-input" type="text" autoFocus onChange={(e) => onSearchChange(e.target.value)} value={searchTerm}></input>
          {searchLoading && <p>loading...</p>}
          <div className="people-scrollable">
            {searchPeople.map((person, i) => <div className="person-search-display" key={i} onClick={() => onSelect(person)}><div className="avatar-container"><img className="image-tiny" src={person.avatar.thumb_url}></img></div>{person.name} {person.wca_id}</div>)}
          </div>
          <p><button onClick={onClose}>Close</button></p>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
