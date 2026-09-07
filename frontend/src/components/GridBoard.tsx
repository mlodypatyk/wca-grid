import type { Grid, GridState } from '../types'
import { getReadableCategoryName } from '../lib/categories'

type Props = {
  grid: Grid
  gridState: GridState
  showSolutions: boolean
  onTileClick: (h: number, v: number) => void
  onShowSolutionsClick: (solutions: string[]) => void
}

const getGridTile = function (grid: Grid, gridState: GridState, showSolutions: boolean, onShowSolutionsClick: (solutions: string[]) => void, h: number, v: number) {
  const person = gridState.state[h][v].state
  if (showSolutions){
    const solutions = grid.squares[h][v]
    return <div className="solution-display" onClick={() => onShowSolutionsClick(solutions)}><p>Solutions: {solutions.length}</p></div>
  }
  if(person == null) return <div className="inner"></div>
  return <div className="person-display"><img src={person.avatar.thumb_url}></img><p className="name-tag">{person.name}</p></div>
}

export default function GridBoard({ grid, gridState, showSolutions, onTileClick, onShowSolutionsClick }: Props) {
  return (
    <div className="grid">
      <div className="grid-row">
        <div className="grid-square"></div>
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[0])}</p></div>
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[1])}</p></div>
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[2])}</p></div>
      </div>
      <div className="grid-row">
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[0])}</p></div>
        <div className="grid-square" onClick={() => onTileClick(0, 0)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 0, 0)}</div>
        <div className="grid-square" onClick={() => onTileClick(0, 1)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 0, 1)}</div>
        <div className="grid-square" onClick={() => onTileClick(0, 2)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 0, 2)}</div>
      </div>
      <div className="grid-row">
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[1])}</p></div>
        <div className="grid-square" onClick={() => onTileClick(1, 0)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 1, 0)}</div>
        <div className="grid-square" onClick={() => onTileClick(1, 1)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 1, 1)}</div>
        <div className="grid-square" onClick={() => onTileClick(1, 2)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 1, 2)}</div>
      </div>
      <div className="grid-row">
        <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[2])}</p></div>
        <div className="grid-square" onClick={() => onTileClick(2, 0)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 2, 0)}</div>
        <div className="grid-square" onClick={() => onTileClick(2, 1)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 2, 1)}</div>
        <div className="grid-square" onClick={() => onTileClick(2, 2)}>{getGridTile(grid, gridState, showSolutions, onShowSolutionsClick, 2, 2)}</div>
      </div>
    </div>
  )
}
