export interface CameraListItem {
  id: string
  name: string
  facturer: string
  position: string
  model: string
  desc: string
  rtsp: string
  status: string | boolean
  video?: string
}

export interface ReportItem extends CameraListItem {
  positionName: string
}

export interface AddCamera {
  name: string
  facturer: string
  position: string
  model: string
  desc: string
  rtsp: string
  status: string
  towards: string
  videoList: array
  sn: string
  streamType: string
}

export interface EditCamera {
  id: string
  name: string
  facturer: string
  position: string
  model: string
  desc: string
  rtsp: string
}
