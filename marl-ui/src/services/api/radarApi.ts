import { AddRadar, EditRadar, RadarListItem } from './../../types/radar.d'
import { httpGet, httpPost, requestConfig, httpDelete } from '../httpServices'
import { reponseParams } from '../interceptors'
let tab = ''
export function getRadarList() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<RadarListItem[]>>({
    url: `/radar${tab}`,
  })
}

export function addRadar(data: AddRadar) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/radar${tab}`,
    data,
  })
}

export function updateRadar(data: EditRadar) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/radar${tab}/update`,
    data,
  })
}

export function deleteRadar(id: string, dir: string) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpDelete({
    url: `/radar${tab}`,
    data: {
      id,
      dir,
    },
  })
}

export function submitReportData() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/radar${tab}/report`,
    config: {
      timeout: 1000 * 60 * 5,
    },
  })
}
