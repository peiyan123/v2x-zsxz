export type OperationTitle = {
  name: string
  type: string
}

export type LaneList = {
  color: string
  type: string
  label: string
  currentOperation: string
  laneType: string
  lanePosition: string
  // 线类型
  lineType: string
  // 实线描述
  lineDescription?: string
}

export type AddLane = {
  id: string
  laneType: string
  lanePosition: string
}

export type AddLine = {
  id: string
  lineDescription: string
}

export type AreaListItem = {
  color: string
  type: string
  label: string
  detectionType?: Array<string>
  selected?: boolean
}

export type EventListItem = {
  color: string
  type: string
  label: string
  // detectionType: Array<string>
  propertyId?: string
  selected?: boolean
}

export type FuseList = {
  color: string
  type: string
  label: string
  currentOperation: string
}
