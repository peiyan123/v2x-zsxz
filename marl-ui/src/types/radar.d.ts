export interface RadarListItem {
  id: string
  name: string
  ip: string
  port: string
  facturer: string
  position: string
  positionName?: string
  model: string
  desc: string
  protocol: string
  status: string | boolean
  groupId?: string
}

export interface AddRadar {
  name: string
  ip: string
  port?: string
  facturer: string
  position: string
  model: string
  desc: string
  protocol: string
  status: string | boolean
  groupId?: string
  sn: string,
  mbcIp: string,
  mbcPort: string,
  mbcNetworkCard: string,
}

export type EditRadar = RadarListItem
