import { useEffect, useState } from 'react'
import './DialogStyles.css'
import './App.css'
import { Dialog, DialogPanel } from '@headlessui/react'
import type { Person } from './wca_types'
import { Bounce, ToastContainer, toast } from 'react-toastify'
import { Share } from '@boxicons/react'
import { getNameFromId } from './eventNames'
import { shuffleArray } from './shuffleArray'


type Grid = {
  h: string[],
  v: string[],
  v_people: string[][],
  h_people: string[][]
}

type TileState = {
  state : Person | null;
}

type GridState = {
  state: TileState[][];
}

function App() {
  const defaultGridState = {state: [[{state: null}, {state: null}, {state: null}], [{state: null}, {state: null}, {state: null}], [{state: null}, {state: null}, {state: null}]]};
  const [grid, setGrid] = useState<Grid | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchPeople, setSearchPeople] = useState<Person[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentH, setCurrentH] = useState<number>(0);
  const [currentV, setCurrentV] = useState<number>(0);
  const [gridState, setGridState] = useState<GridState>(defaultGridState)
  const [guessesRemaining, setGuessesRemaining] = useState<number>(12);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const closeModal = () => setModalOpen(false);
  const [solutionsDialog, setSolutionsDialog] = useState<boolean>(false);
  const [solutionsPeople, setSolutionsPeople] = useState<string[]>([]);

  useEffect(() => {handleStartup()}, [])

  useEffect(() => {saveStateToLocalStorage()}, [grid, gridState, guessesRemaining])

  useEffect(() => {
    if (searchTerm === "") return;
    const delayDebounceFn = setTimeout(() => {loadPeopleFromApi()}, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const loadGridFromApi = async function () {
    let result = await fetch('https://grid.shab.waw.pl/api/get_grid');
    let json = await result.json();
    setGrid(json);
  }

  const handleStartup = function () {
    loadFromLocalStorage();
  }

  const loadPeopleFromApi = function () {
    setSearchLoading(true);fetch(`https://www.worldcubeassociation.org/api/v0/search/users?q=${searchTerm}&persons_table=true`).then((result) => {result.json().then((json) => {setSearchLoading(false); setSearchPeople(json.result)})});
  }

  const saveStateToLocalStorage = function () {
    if (grid === null) return;
    localStorage.setItem("grid", JSON.stringify(grid))
    localStorage.setItem("gridState", JSON.stringify(gridState))
    localStorage.setItem("guessesRemaining", guessesRemaining.toString())
  }

  const loadFromLocalStorage = function () {
    let gridStr = localStorage.getItem("grid");
    if(gridStr === null){
      setGrid(null)
      loadGridFromApi();
      return;
    }else{
      setGrid(JSON.parse(gridStr))
    }
    setGridState(JSON.parse(localStorage.getItem("gridState") ?? JSON.stringify(defaultGridState)))
    let guessesStr = localStorage.getItem("guessesRemaining");
    if (guessesStr == null || isNaN(Number(guessesStr))){
      setGuessesRemaining(12);
    }else {
      setGuessesRemaining(Number(guessesStr))
    }

    setGuessesRemaining(localStorage.getItem("guessesRemaining") as unknown as number)
  }

  const handleShare = function () {
    if(grid == null) return;
    let finalText = ''
    let emojis = ['🦆', '🦄', '🐷', '🐤', '🦞', '🐯', '🐘', '🐍', '🐝', '🐳']
    let okay = '✅'
    let wrong = '❌'
    shuffleArray(emojis);
    if(gameState() == "win"){
      finalText += `${guessesRemaining} guesses remaining\n`
    }

    finalText += '⬛'
    for(let i=0;i<3;i++){
      finalText+=emojis[i];
    }
    finalText += '\n'
    for(let i=0;i<3;i++){
      finalText += emojis[i+3];
      for(let j=0;j<3;j++){
        if(gridState.state[i][j].state == null){
          finalText += wrong;
        }else{
          finalText += okay;
        }
      }
      finalText += '\n'
    }
    finalText += '\n';
    for(let i=0;i<3;i++){
      finalText += emojis[i];
      finalText += ': '
      finalText += getReadableCategoryName(grid.v[i])
      finalText += '\n'
    }
    for(let i=0;i<3;i++){
      finalText += emojis[i+3];
      finalText += ': '
      finalText += getReadableCategoryName(grid.h[i])
      finalText += '\n'
    }

    finalText += 'Try your skills at: https://grid.shab.waw.pl\n'
    navigator.clipboard.writeText(finalText).then(()=>{toastCopiedSuccess()}, () => {toastCopiedFailed()})

  }

  const toastCopiedSuccess = function () {
    toast.success('Copied to clipboard!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  }

  const toastCopiedFailed = function (){
    toast.error('Failed to copy.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
      });
  }

  const toastWrongGuess = function () {
    toast.error('Wrong guess!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
      });
    
  }

  const toastAlreadyGuessed = function () {
    toast.warn('Already guessed.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
  });
  }

  const handleClick = function (h: number, v: number) {
    if(gridState.state[h][v].state != null) return;
    if(guessesRemaining == 0) return;
    setCurrentH(h);
    setCurrentV(v);
    setModalOpen(true);
  }

  const handleGuess = function(person: Person) {
    let wca_id = person.wca_id;
    if(grid == null) return;
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        let slot = gridState.state[i][j].state;
        if(slot != null && slot.wca_id == person.wca_id){
          toastAlreadyGuessed();
          return;
        }
      }
    }
    setGuessesRemaining(guessesRemaining-1);
    if(!grid.v_people[currentV].includes(wca_id))
    {
      toastWrongGuess();
      saveStateToLocalStorage();
      return;
    }
    if(!grid.h_people[currentH].includes(wca_id))
    {
      toastWrongGuess();
      saveStateToLocalStorage();
      return;
    }
    let newGridState = gridState;
    newGridState.state[currentH][currentV].state = person;
    setGridState(newGridState);
    saveStateToLocalStorage();
  }

  const getGridTile = function(h: number, v: number) { 
    let person = gridState.state[h][v].state
    if(grid == null) return;
    if (showSolutions){
      const solutions = grid.h_people[h].filter((value) => grid.v_people[v].includes(value))
      return <div className="solution-display" onClick={()=>{setSolutionsPeople(solutions); setSolutionsDialog(true)}}><p>Solutions: {solutions.length}</p></div>
    }
    if(person == null) return <div className="inner"></div>
    if(!showSolutions){
      return <div className="person-display"><img src={person.avatar.thumb_url}></img><p className="name-tag">{person.name}</p></div>
    }
  }

  const handleNewGameClick = function () {
    loadGridFromApi();
    setGridState({state: [[{state: null}, {state: null}, {state: null}], [{state: null}, {state: null}, {state: null}], [{state: null}, {state: null}, {state: null}]]})
    setGuessesRemaining(12);
    setShowSolutions(false);
  }

  const gameState = function() {
    let isSolved = true;
    for(let i=0;i<3;i++){
      for(let j=0;j<3;j++){
        let slot = gridState.state[i][j].state;
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

  const getReadableCategoryName = function(category: string) {
    let catType = category.split(':')[0];
    let catData = category.split(':')[1];
    if (catType == 'result'){
      let event = catData.split(' ')[1];
      let requirement = catData.split(' ')[2].substring(4)
      return `${getNameFromId(event)} under ${parseFloat(requirement).toString()}${event == '333fm' ? ' moves' : 's'}`
    }
    if (catType == 'cont_podium'){
      return `Continental championship podium: ${catData.substring(2)}`
    }
    if (catType == 'worlds_podium'){
      return `World championship podium`
    }
    if (catType == 'comps'){
      return `${catData.substring(1)} competitions`
    }
    return category
  }
  return (
    <>
      {grid == null  ? <p>loading...</p> : 
    <div>
      <ToastContainer />
      <div className="guessInfo">Guesses remaining: {guessesRemaining}</div>
      <Dialog open={modalOpen} onClose={closeModal} className="dialog-wrapper">
          <div className="dialog-backdrop" />
          <div className="dialog-container">
          <DialogPanel className="dialog-panel">
            <input className="search-input" type="text" autoFocus onChange={(e) => setSearchTerm(e.target.value)}></input>
            {searchLoading && <p>loading...</p>}
            <div className="people-scrollable">
            {searchPeople.map((person, i) => <div className="person-search-display" key={i} onClick={() => {handleGuess(person); closeModal(); setSearchPeople([])}}><div className="avatar-container"><img className="image-tiny" src={person.avatar.thumb_url}></img></div>{person.name} {person.wca_id}</div>)}
            </div>
            <p><button onClick={() => setModalOpen(false)}>Close</button></p>
          </DialogPanel>
          </div>
      </Dialog>
      <Dialog open={solutionsDialog} onClose={()=>setSolutionsDialog(false)} className="dialog-wrapper">
        <div className="dialog-backdrop" />
          <div className="dialog-container">
            <DialogPanel className="dialog-panel">
            <div className="solutions-scrollable">
              {solutionsPeople.map((person, i) => <p key={i}><a href={`https://www.worldcubeassociation.org/persons/${person}`} target="_blank">{person}</a></p>)}
            </div>
            <p><button onClick={() => setSolutionsDialog(false)}>Close</button></p>
            </DialogPanel>
          </div>
      </Dialog>
      <div className = "grid">
        <div className="grid-row">
          <div className="grid-square"></div>
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[0])}</p></div>
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[1])}</p></div>
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.v[2])}</p></div>
        </div>
        <div className="grid-row">
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[0])}</p></div>
          <div className="grid-square" onClick={() => handleClick(0, 0)}>{getGridTile(0, 0)}</div>
          <div className="grid-square" onClick={() => handleClick(0, 1)}>{getGridTile(0, 1)}</div>
          <div className="grid-square" onClick={() => handleClick(0, 2)}>{getGridTile(0, 2)}</div>
        </div>
        <div className="grid-row">
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[1])}</p></div>
          <div className="grid-square" onClick={() => handleClick(1, 0)}>{getGridTile(1, 0)}</div>
          <div className="grid-square" onClick={() => handleClick(1, 1)}>{getGridTile(1, 1)}</div>
          <div className="grid-square" onClick={() => handleClick(1, 2)}>{getGridTile(1, 2)}</div>
        </div>
        <div className="grid-row">
          <div className="grid-square"><p className="grid-content">{getReadableCategoryName(grid.h[2])}</p></div>
          <div className="grid-square" onClick={() => handleClick(2, 0)}>{getGridTile(2, 0)}</div>
          <div className="grid-square" onClick={() => handleClick(2, 1)}>{getGridTile(2, 1)}</div>
          <div className="grid-square" onClick={() => handleClick(2, 2)}>{getGridTile(2, 2)}</div>
        </div>
      </div>
      {guessesRemaining != 0 && <div className="ff-button-container"><button className="ff-button" onClick={()=>{setGuessesRemaining(0)}}>Give up</button></div>}
      {gameState() == "win" && <div className="result-box win">
        <p className="result-box-text">You won! With {guessesRemaining} {guessesRemaining == 1 ? "guess" : "guesses"} remaining. </p>
        <p>Share your result!</p>
        <button className="shareButton" onClick={handleShare}><span className="buttonText">Share</span> <Share /></button>
      </div>}
      {gameState() == "lose" && <div className="result-box lose">
        <p className="result-box-text">You lost 😞</p>
        <p>Share your result!</p>
        <button className="shareButton" onClick={handleShare}><span className="buttonText">Share</span> <Share /></button>
      </div>}
      {gameState() != "ongoing" && <p><button onClick={() => setShowSolutions(!showSolutions)}>{showSolutions ? 'Hide solutions' : 'Show solutions'}</button><button className="resetButton" onClick={handleNewGameClick}>New game</button></p>}
    </div>}
    </>
  )
}

export default App
