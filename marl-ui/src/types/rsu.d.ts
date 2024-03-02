export interface RsuListItem {
  id: string
  name: string
  ip: string
  port: string
  facturer: string
  position: string
  model: string
  desc: string
  protocol: string
  status: string | boolean
}

export interface AddRsu {
  name: string
  ip: string
  port: string
  facturer: string
  emergencyThreshold: number
  frequency: number
  heartbeatPeriod: number
  sendPeriod: number
  position: string
  model: string
  desc: string
  protocol: string
  status: string | boolean
}

export type EditRsu = RsuListItem
