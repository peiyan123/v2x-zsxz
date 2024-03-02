import { regIp } from '@/core/constant'
import { RuleObject } from 'ant-design-vue/lib/form/interface'

export function blankValidate(_rule: RuleObject, value: string) {
  const regBlank = /\s+/
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}

export function ipValidate(_rule: RuleObject, value: string) {
  const regIp =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  if (value && !regIp.test(value)) {
    return Promise.reject('请输入正确的ip地址')
  }
  const regBlank = /\s+/
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}
/**
 * 经度值的校验方法
 * @param _rule 规则对象
 * @param value 待校验的值
 * @param notEmpty 是否必须有值
 * @returns Promise对象
 */
export function lonValidate(_rule: RuleObject, value: string, notEmpty?: boolean) {
  // 如果不能为空且未输入值，则校验不通过
  if (notEmpty && !value) {
    return Promise.reject('请输入正确的经度')
  }
  // 经度： -180.0～+180.0（整数部分为0～180，必须输入1到10位小数）
  const regLon =
    /(^-?([0-9])$)|(^-?[1-9]\d$)|(^-?1[0-7]\d$)|(^-?180$)|(^-?([0-9])\.\d{1,10}$)|(^-?[1-9]\d\.\d{1,10}$)|(^-?1[0-7]\d\.\d{1,10}$)|(^-?180.0{1,10}$)/
  // 如果没有输入，则不校验，输入有字符，则用正则校验
  if (value && !regLon.test(value)) {
    return Promise.reject('请输入正确的经度')
  }
  const regBlank = /\s+/
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}
/**
 * 纬度值的校验方法
 * @param _rule 规则对象
 * @param value 待校验的值
 * @param notEmpty 是否必须有值
 * @returns Promise对象
 */
export function latValidate(_rule: RuleObject, value: string, notEmpty?: boolean) {
  // 如果不能为空且未输入值，则校验不通过
  if (notEmpty && !value) {
    return Promise.reject('请输入正确的纬度')
  }
  // 纬度： -90.0～+90.0（整数部分为0～90，必须输入1到10位小数）
  const regLat = /^-?((0|[1-8]?[0-9]?)(([.][0-9]{1,10})?)|90(([.][0]{1,10})?))$/
  if (value && !regLat.test(value)) {
    return Promise.reject('请输入正确的纬度')
  }
  const regBlank = /\s+/
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}

export function rtspValidate(_rule: RuleObject, value: string) {
  const regRtsp = /rtsp:\/\/(\w{1,20}:\w{1,20}@)?\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/
  const regBlank = /\s+/
  if (value && !regRtsp.test(value)) {
    return Promise.reject('请输入正确的rtsp地址')
  }
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}

export function portValidate(_rule: RuleObject, value: string) {
  const regInt = /^[1-9]\d*$/
  const regBlank = /\s+/
  if (value && (!regInt.test(value) || Number(value) < 1000 || Number(value) > 65535)) {
    return Promise.reject('请输入1000-65535')
  }
  if (value && regBlank.test(value)) {
    return Promise.reject('不能输入空白字符')
  }
  return Promise.resolve()
}

export function domainIpValidate(_rule: RuleObject, value: string) {
  const regDomain = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?/
  const regIp =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  if (!value || (value && regDomain.test(value)) || (value && regIp.test(value))) {
    return Promise.resolve()
  } else {
    return Promise.reject('请输入正确的服务器地址')
  }
}
