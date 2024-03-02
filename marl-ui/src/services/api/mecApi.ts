import { MecConfig, MecRunningInfo, MqttConnect } from '@/types/mec'
import { httpPost, httpGet } from '../httpServices'
import { reponseParams } from '../interceptors'
let tab = ''
export function saveMecConfig(data: MecConfig) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/mec${tab}`,
    data,
  })
}

export function getMecConfig() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet({
    url: `/mec${tab}`,
  })
}

// 获取mec运行状态
export function getMecInfo() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<any>>({
    url: `/mec${tab}/info`,
    hideLoading: true,
  })
}
/**
 * 获取应用列表数据
 * @returns Promise对象
 */
export function getApplications(data?) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<any>>({
    url: `/mec${tab}/applications`,
    data,
  })
}
/**
 * 获取全息路口的中心点坐标及范围值
 * @returns Promise对象
 */
export function getRoadConfig(tab) {
  return httpGet({
    url: `/mec${tab}/road/config`,
  })
}

// mqtt测试连接
export function testConnect(data: MqttConnect) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/test-connect${tab}`,
    data,
  })
}
/**
 * 调用使算法配置生效的接口
 * @returns Promise对象
 */
export function saveApply() {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpGet<reponseParams<any>>({
    url: `/mec${tab}/apply`,
  })
}
