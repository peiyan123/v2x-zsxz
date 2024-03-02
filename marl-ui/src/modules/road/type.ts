export type cartDataItem = {
  height: number
  latitude: number
  longitude: number
  objectId: string | number
  width: number
  objectType: number
  direction?: number
  wgs_move_direction: number
}

export type CarMapVal = {
  id: string | number
  type: number
  curx: number
  cury: number
  style: {
    left: string
    top: string
    transform: string
  }
  [name: string]: any
}
