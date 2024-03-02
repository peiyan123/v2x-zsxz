import { httpPost, httpGet } from '../httpServices'
/**
 * 保存single task config
 * @param data 保存的数据
 * @returns Promise对象
 */
let tab = ''
export function saveSingleConfig(data: Record<string, any>) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/task${tab}/single`,
    data,
  })
}
/**
 * 保存multiple task config
 * @param data 保存的数据
 * @returns Promise对象
 */
export function saveMultipleConfig(data: Record<string, any>) {
  tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  return httpPost({
    url: `/task${tab}/multiple`,
    data,
  })
}
/**
 * 获取 task config
 * @returns Promise对象
 */
export function getTaskConfig(hash) {
  return httpGet({
    url: `/task${hash}`,
  })
}
