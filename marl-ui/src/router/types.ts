export interface Menu {
  title?: string

  icon?: string

  path: string

  disabled?: boolean

  children?: Menu[]

  hideMenu?: boolean

  [key: string]: any
}
