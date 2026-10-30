import { Dialog, DialogPanel } from '@headlessui/react'
import type { Person } from '../wca_types'
import type { SquareRating } from '../lib/api'
import { noProfileIcon } from '../types'
import GuessRating from './GuessRating'

type Props = {
  open: boolean
  onClose: () => void
  solutionsPeople: string[]
  peopleData: Map<string, Person>
  ratings: Map<string, SquareRating>
}

export default function SolutionsDialog({ open, onClose, solutionsPeople, peopleData, ratings }: Props) {
  const sortedPeople = [...solutionsPeople].sort((a, b) => {
    const ratingA = ratings.get(a)
    const ratingB = ratings.get(b)
    const valueA = ratingA && ratingA.showings > 0 ? ratingA.hits / ratingA.showings : -1
    const valueB = ratingB && ratingB.showings > 0 ? ratingB.hits / ratingB.showings : -1
    return valueA - valueB
  })
  return (
    <Dialog open={open} onClose={onClose} className="dialog-wrapper">
      <div className="dialog-backdrop" />
      <div className="dialog-container">
        <DialogPanel className="dialog-panel">
          <div className="solutions-scrollable">
            {sortedPeople.map((person, i) => {
              const rating = ratings.get(person)
              return <div className="person-search-display" key={i}>
                <div className="avatar-container"><img className="image-tiny" src={peopleData.has(person) ? peopleData.get(person)!.avatar.thumb_url : noProfileIcon}></img></div>
                <a href={`https://www.worldcubeassociation.org/persons/${person}`} target="_blank">{peopleData.has(person) ? peopleData.get(person)!.name : person}</a>
                {rating && rating.showings > 0 && <GuessRating rating={rating.hits / rating.showings} />}
              </div>
            })}
          </div>
          <p><button onClick={onClose}>Close</button></p>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
