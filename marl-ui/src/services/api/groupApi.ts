import { AddGroup, EditGroup, GroupListItem } from '../../types/group'
import { httpGet, httpPost, httpDelete, uploadFiles } from '../httpServices'
import { reponseParams } from '../interceptors'
let tab = ''
export function getGroupList(hash) {
  return httpGet<reponseParams<GroupListItem[]>>({
    url: `/group${hash}`,
  })
}

export function getGroupInfo(id) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<Record<string, any>>>({
    url: `/group${tab}/info`,
    data: {
      id,
    },
  })
}

export function pullData(id) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<Record<string, any>>>({
    url: `/group${tab}/pull`,
    data: {
      id,
    },
  })
}

export function addGroup(data: AddGroup) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/group${tab}`,
    data,
  })
}

export function updateGroup(data: EditGroup) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/group${tab}/update`,
    data,
  })
}

export function deleteGroup(id: string) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpDelete({
    url: `/group${tab}`,
    data: {
      id,
    },
  })
}

export function getSubDevice() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<Record<string, any>>>({
    url: '/settings/sub-device',
  })
}

export function setSubDevice(isSubDevice) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost<reponseParams<Record<string, any>>>({
    url: '/settings/sub-device',
    data: { isSubDevice },
  })
}

export function uploadConfigFiles(params, handleProgress?) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return uploadFiles(
    {
      url: `/group${tab}/upload/configs`,
      onUploadProgress: handleProgress,
    },
    params,
    { cancelResponseCatch: true }
  )
}
