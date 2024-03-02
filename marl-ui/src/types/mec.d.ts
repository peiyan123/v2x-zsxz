import { MecRunningInfo } from './mec.d'
export interface MecAppListItem {
  names: string
  image: string
  status: string
  ports: string
  command: string
  container_id: string
  created: string
}

export interface MecConfig {
  imageUrl?: string
  latitude?: string
  longitude?: string
  username?: string
  port?: string
  ip?: string
  password?: string
  deviceId?: string
  sn?: string
  elevation?: string
}

export interface AppListItem {
  container_id?: string
  names: string
  image: string
  status: string
  ports: string
  created?: string
  command?: string
}

// export interface MecRunningInfo {
//   cpuUsage: number
//   gpuUsage: number
//   memInfo: {
//     totalMemMb: number
//     usedMemMb: number
//     freeMemMb: number
//     usedMemPercentage: number
//     freeMemPercentage: number
//   }
//   driveInfo: {
//     totalGb: string
//     usedGb: string
//     freeGb: string
//     usedPercentage: string
//     freePercentage: string
//   }
//   appList: AppListItem[]
// }

export interface MecRunningInfo {
  'cpu-usage': number
  'gpu-usage': number
  memory_total: number
  memory_used: number
  memory_avail: number
  memory: {
    free: number
    total: number
    used: number
  }
  disks: Array<{
    dir: string
    total: number
    used: number
  }>
}

export interface CheckData {
  image_width: number
  image_height: number
  in_type: string
  mode: string
  in_params: string
  center?: {
    longitude: any
    latitude: any
  }
  direction?: any[]
  out_params_mark: Array<{
    img_x: any
    img_y: any
    longitude: any
    latitude: any
  }>
}

export interface CheckDataRes {
  is_pass: boolean
  mode: string
  invalid_points: Array<{
    img_x: any
    img_y: any
    longitude: any
    latitude: any
    world_x: any
    world_y: any
  }>
}

export interface MqttConnect {
  ip: string
  port: string
  username: string
  password: string
}
