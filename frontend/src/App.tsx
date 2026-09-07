import { useEffect, useRef, useState } from 'react'
import './DialogStyles.css'
import './App.css'
import { ToastContainer } from 'react-toastify'
import type { Person } from './wca_types'
import type { Grid, GridState } from './types'
import { InfoCircle } from '@boxicons/react'
import { getTodayString, parseDate, toDateString } from './lib/dates'
import { makeDefaultGridState } from './lib/gridState'
import { getInitialDailyState, saveStateToLocalStorage } from './lib/storage'
import { loadDailyGrid, loadFreeGrid, loadGridFromApi, loadSolutionsPersonData, recordGuess, searchUsers, type LoadedState } from './lib/api'
import { buildShareText, type GameState } from './lib/share'
import { toastAlreadyGuessed, toastCopiedFailed, toastCopiedSuccess, toastWrongGuess } from './lib/toasts'
import GridBoard from './components/GridBoard'
import PersonSearchDialog from './components/PersonSearchDialog'
import SolutionsDialog from './components/SolutionsDialog'
import InfoDialog from './components/InfoDialog'
import ModeToggle from './components/ModeToggle'
import DateNav from './components/DateNav'
import ResultBox from './components/ResultBox'

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [grid, setGrid] = useState<Grid | null>(() => getInitialDailyState()?.grid ?? null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchPeople, setSearchPeople] = useState<Person[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentH, setCurrentH] = useState<number>(0);
  const [currentV, setCurrentV] = useState<number>(0);
  const [gridState, setGridState] = useState<GridState>(() => getInitialDailyState()?.gridState ?? makeDefaultGridState())
  const [guessesRemaining, setGuessesRemaining] = useState<number>(() => getInitialDailyState()?.guessesRemaining ?? 12);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [solutionsDialog, setSolutionsDialog] = useState<boolean>(false);
  const [solutionsPeople, setSolutionsPeople] = useState<string[]>([]);
  const [peopleData, setPeopleData] = useState<Map<string, Person>>(new Map<string, Person>);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [mode, setMode] = useState<'daily' | 'free'>('daily');
  const [currentDate, setCurrentDate] = useState<string>(getTodayString);

  const modeRef = useRef(mode);
  const currentDateRef = useRef(currentDate);

  const closeModal = () => setModalOpen(false);

  const applyLoadedState = function (loaded: LoadedState) {
    setGrid(loaded.grid);
    setGridState(loaded.gridState);
    setGuessesRemaining(loaded.guessesRemaining);
  }

  const switchMode = function (newMode: 'daily' | 'free') {
    if (newMode === mode) return;
    setMode(newMode);
    setShowSolutions(false);
    setSearchTerm("");
    setSearchPeople([]);
    setModalOpen(false);
    if (newMode === 'daily') {
      loadDailyGrid(backendUrl, currentDateRef.current).then(applyLoadedState);
    } else {
      loadFreeGrid(backendUrl).then(applyLoadedState);
    }
  }

  const changeDate = function (newDate: string) {
    if (newDate === currentDateRef.current) return;
    setCurrentDate(newDate);
    setShowSolutions(false);
    loadDailyGrid(backendUrl, newDate).then(applyLoadedState);
  }

  const shiftDate = function (delta: number) {
    const d = parseDate(currentDateRef.current);
    d.setDate(d.getDate() + delta);
    changeDate(toDateString(d));
  }

  const handleShare = function () {
    if(grid == null) return;
    const finalText = buildShareText(mode, grid, gridState, guessesRemaining, gameState());
    navigator.clipboard.writeText(finalText).then(() => { toastCopiedSuccess() }, () => { toastCopiedFailed() })
  }

  const handleClick = function (h: number, v: number) {
    if(gridState.state[h][v].state != null) return;
    if(guessesRemaining == 0) return;
    setCurrentH(h);
    setCurrentV(v);
    setSearchTerm("");
    setSearchPeople([]);
    setModalOpen(true);
  }

  const handleGuess = function(person: Person) {
    const wca_id = person.wca_id;
    if(grid == null) return;
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        const slot = gridState.state[i][j].state;
        if(slot != null && slot.wca_id == person.wca_id){
          toastAlreadyGuessed();
          return;
        }
      }
    }
    setGuessesRemaining(guessesRemaining-1);
    if(!grid.squares[currentH][currentV].includes(wca_id))
    {
      toastWrongGuess();
      return;
    }
    const newGridState = { state: gridState.state.map(row => row.map(tile => ({ ...tile }))) };
    newGridState.state[currentH][currentV].state = person;
    setGridState(newGridState);
    recordGuess(backendUrl, person.wca_id, grid.h[currentH], grid.v[currentV])
  }

  const handleNewGameClick = function () {
    loadGridFromApi(backendUrl).then(setGrid);
    setGridState(makeDefaultGridState())
    setGuessesRemaining(12);
    setShowSolutions(false);
  }

  const gameState = function (): GameState {
    let isSolved = true;
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        const slot = gridState.state[i][j].state;
        if(slot == null){
          isSolved = false;
        }
      }
    }
    if(isSolved){
      return "win";
    } else if(guessesRemaining == 0 ){
      return "lose";
    } else {
      return "ongoing"
    }
  }

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { currentDateRef.current = currentDate }, [currentDate])
  useEffect(() => {
    if (grid !== null) return;
    loadDailyGrid(backendUrl, currentDate).then(applyLoadedState);
  }, [])
  useEffect(() => {
    if (grid === null) return;
    saveStateToLocalStorage(modeRef.current, currentDateRef.current, grid, gridState, guessesRemaining);
  }, [grid, gridState, guessesRemaining])
  useEffect(() => {
    if (grid === null) return;
    loadSolutionsPersonData(grid).then(setPeopleData);
  }, [grid])

  useEffect(() => {
    if (searchTerm === "") return;
    const delayDebounceFn = setTimeout(() => {
      setSearchLoading(true);
      searchUsers(searchTerm).then((people) => {
        setSearchLoading(false);
        setSearchPeople(people);
      });
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  return (
    <>
      {grid == null  ? <p>loading...</p> : 
    <div>
      <ToastContainer />
      <PersonSearchDialog
        open={modalOpen}
        onClose={closeModal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchLoading={searchLoading}
        searchPeople={searchPeople}
        onSelect={(person) => { handleGuess(person); closeModal(); setSearchPeople([]) }}
      />
      <SolutionsDialog
        open={solutionsDialog}
        onClose={() => setSolutionsDialog(false)}
        solutionsPeople={solutionsPeople}
        peopleData={peopleData}
      />
      <InfoDialog open={showInfo} onClose={() => setShowInfo(false)} />
      <ModeToggle mode={mode} onSwitch={switchMode} />
      {mode === 'daily' && <DateNav currentDate={currentDate} onShiftDate={shiftDate} onChangeDate={changeDate} />}
      <div className="info-container"><div className="guess-info">Guesses remaining: {guessesRemaining}</div><div className="info-circle" onClick={() => {setShowInfo(true)}}><InfoCircle/></div></div>
      <GridBoard
        grid={grid}
        gridState={gridState}
        showSolutions={showSolutions}
        onTileClick={handleClick}
        onShowSolutionsClick={(solutions) => { setSolutionsPeople(solutions); setSolutionsDialog(true) }}
      />
      <ResultBox
        gameState={gameState()}
        guessesRemaining={guessesRemaining}
        showSolutions={showSolutions}
        isFree={mode === 'free'}
        onShare={handleShare}
        onGiveUp={() => setGuessesRemaining(0)}
        onToggleSolutions={() => setShowSolutions(!showSolutions)}
        onNewGame={handleNewGameClick}
      />
    </div>}
    </>
  )
}

export default App
