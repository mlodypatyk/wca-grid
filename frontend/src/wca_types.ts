export interface Person  {
  id: string
  wca_id: string
  name: string
  gender: string
  country_iso2: string
  created_at: string
  updated_at: string
  url: string
  country: Country
  delegate_status: any
  class: string
  teams: Team[]
  avatar: Avatar2
  dob: string
  incorrect_wca_id_claim_count: number
}

export interface Country {
  id: string
  name: string
  continent_id: string
  iso2: string
}

export interface Team {
  id: number
  friendly_id: string
  leader: boolean
  senior_member: boolean
  name: string
  wca_id: string
  avatar: Avatar
}

export interface Avatar {
  id: number | null
  status: string
  thumbnail_crop_x: number
  thumbnail_crop_y: number
  thumbnail_crop_w: number
  thumbnail_crop_h: number
  url: string
  thumb_url: string
  is_default: boolean
  can_edit_thumbnail: boolean
}

export interface Avatar2 {
  id: number
  status: string
  thumbnail_crop_x: number
  thumbnail_crop_y: number
  thumbnail_crop_w: number
  thumbnail_crop_h: number
  url: string
  thumb_url: string
  is_default: boolean
  can_edit_thumbnail: boolean
}
