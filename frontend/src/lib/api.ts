import type { Grid, GridState, PersonsApiResponse } from '../types'
import type { Person } from '../wca_types'
import { makeDefaultGridState } from './gridState'

export type LoadedState = { grid: Grid; gridState: GridState; guessesRemaining: number }

export const loadGridFromApi = async function (backendUrl: string): Promise<Grid> {
  const result = await fetch(backendUrl + '/api/get_grid');
  const json: Grid = await result.json();
  return json;
}

export const loadDailyGrid = async function (backendUrl: string, date: string): Promise<LoadedState> {
  const saved = localStorage.getItem(`daily_state_${date}`);
  if (saved !== null) {
    return JSON.parse(saved);
  }
  const result = await fetch(`${backendUrl}/api/get_daily_grid?date=${date}`);
  const json: Grid = await result.json();
  return { grid: json, gridState: makeDefaultGridState(), guessesRemaining: 12 };
}

export const loadSeededGrid = async function (backendUrl: string, seed: string): Promise<LoadedState> {
  const result = await fetch(`${backendUrl}/api/get_seeded_grid?seed=${seed}`);
  const json: Grid = await result.json();
  return { grid: json, gridState: makeDefaultGridState(), guessesRemaining: 12 };
}

export const saveSeededGrid = function (backendUrl: string, seed: string) {
  fetch(`${backendUrl}/api/save_seeded_grid?seed=${seed}`, { method: 'POST' })
}

export const loadFreeGrid = async function (backendUrl: string): Promise<LoadedState> {
  const savedGrid = localStorage.getItem("free_grid");
  if (savedGrid !== null) {
    const savedState = localStorage.getItem("free_gridState");
    const savedGuesses = localStorage.getItem("free_guesses");
    return {
      grid: JSON.parse(savedGrid),
      gridState: JSON.parse(savedState ?? JSON.stringify(makeDefaultGridState())),
      guessesRemaining: savedGuesses === null || isNaN(Number(savedGuesses)) ? 12 : Number(savedGuesses),
    };
  }
  const grid = await loadGridFromApi(backendUrl);
  return { grid, gridState: makeDefaultGridState(), guessesRemaining: 12 };
}

export const recordGuess = function (backendUrl: string, wca_id: string, cat1: string, cat2: string) {
  const params = new URLSearchParams();
  params.append('wca_id', wca_id)
  params.append('cat1', cat1)
  params.append('cat2', cat2)
  fetch(backendUrl + `/api/record_guess?${params}`)
}

export const searchUsers = function (searchTerm: string): Promise<Person[]> {
  return fetch(`https://www.worldcubeassociation.org/api/v0/search/users?q=${searchTerm}&persons_table=true`)
    .then((result) => result.json())
    .then((json) => json.result);
}

export const loadSolutionsPersonData = function (grid: Grid): Promise<Map<string, Person>> {
  if(import.meta.env.DEV) return Promise.resolve(new Map()); // annoy wca servers a bit less
  const wca_ids_set = new Set<string>();
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      const solutions = grid.squares[i][j]
      solutions.map((wca_id) => {wca_ids_set.add(wca_id)});
    }
  }
  const wca_ids = Array.from(wca_ids_set.values())
  const personData = new Map<string, Person>();
  const fetchChunk = function (handledIds: number): Promise<void> {
    if (handledIds >= wca_ids.length) {
      return Promise.resolve();
    }
    let range_end = handledIds + 20;
    if(range_end > wca_ids.length){
      range_end = wca_ids.length;
    }
    const idsToRequest = wca_ids.slice(handledIds, range_end)
    return fetch(`https://www.worldcubeassociation.org/api/v0/persons?wca_ids=${idsToRequest.join(',')}`)
      .then((response) => response.json())
      .then((people: Array<PersonsApiResponse>) => {
        people.map((person) => {personData.set(person.person.wca_id, person.person)})
        return fetchChunk(handledIds + 20);
      });
  };
  return fetchChunk(0).then(() => personData);
}
