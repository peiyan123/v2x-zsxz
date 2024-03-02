import { AddRsu, EditRsu, RsuListItem } from './../../types/rsu.d'
import { httpGet, httpPost, requestConfig, httpDelete } from '../httpServices'
import { reponseParams } from '../interceptors'

export function getRsuList() {
  return httpGet<reponseParams<RsuListItem>>({
    url: '/rsu',
  })
}

export function addRsu(data: AddRsu) {
  return httpPost({
    url: '/rsu',
    data,
  })
}

export function updateRsu(data: EditRsu) {
  return httpPost({
    url: '/rsu/update',
    data,
  })
}

export function deleteRsu(id: string) {
  return httpDelete({
    url: '/rsu',
    data: {
      id,
    },
  })
}

export function submitReportData() {
  return httpPost({
    url: '/rsu/report',
    config: {
      timeout: 1000 * 60 * 5,
    },
  })
}
