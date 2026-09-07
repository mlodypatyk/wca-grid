import type { Person } from './wca_types'

export type Grid = {
  h: string[],
  v: string[],
  squares: string[][][],
  date?: string,
  number?: number,
  seed?: string,
}

export type TileState = {
  state: Person | null;
  guessRating: number | null;
}

export type GridState = {
  state: TileState[][];
}

export type PersonsApiResponse = {
  person: Person
}

export const noProfileIcon = 'https://assets.worldcubeassociation.org/assets/2137bf1/assets/missing_avatar_thumb-d77f478a307a91a9d4a083ad197012a391d5410f6dd26cb0b0e3118a5de71438.png'
