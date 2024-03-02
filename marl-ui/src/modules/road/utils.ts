import { Ref } from 'vue'

interface LonLat {
  longitude: number
  latitude: number
}

// 计算经纬度转化成图片上的比列（单个像素的比列）
export function calcMapRatio(center: LonLat, width: number, height: number, range: { lat: number; long: number }) {
  console.log(width, height)
  // 计算标准依照：图片右侧为北，左侧为南，上方为西，下方为东，如果方位变化，则下面计算中的加减方式也需要调整
  const leftTop: LonLat = {
    longitude: center.longitude - range.long,
    latitude: center.latitude - range.lat,
  }
  const rightTop: LonLat = {
    longitude: center.longitude - range.long,
    latitude: center.latitude + range.lat,
  }
  const leftBottom: LonLat = {
    longitude: center.longitude + range.long,
    latitude: center.latitude - range.lat,
  }
  // const leftTop: LonLat = {
  //   longitude: 104.08843,
  //   latitude: 30.509855,
  // }
  // const rightTop: LonLat = {
  //   longitude: 104.089497,
  //   latitude: 30.509383,
  // }
  // const leftBottom: LonLat = {
  //   longitude: 104.087824,
  //   latitude: 30.508971,
  // }
  // const ratio =
  //   (leftTop.latitude - rightTop.latitude) /
  //   Math.sqrt(
  //     Math.pow(Math.abs(leftTop.latitude - rightTop.latitude), 2) +
  //       Math.pow(Math.abs(leftTop.longitude - rightTop.longitude), 2)
  //   )
  // console.log(Math.acos(ratio))
  // 两点的之间的距离
  const w_dy = Math.abs(rightTop.latitude - leftTop.latitude)
  const w_dx = Math.abs(rightTop.longitude - leftTop.longitude)
  const w_dis = Math.sqrt(Math.pow(w_dx, 2) + Math.pow(w_dy, 2))
  const h_dy = Math.abs(leftBottom.latitude - leftTop.latitude)
  const h_dx = Math.abs(leftBottom.longitude - leftTop.longitude)
  const h_dis = Math.sqrt(Math.pow(h_dx, 2) + Math.pow(h_dy, 2))
  return {
    wRatio: width / w_dis,
    hRatio: height / h_dis,
    imgCenter: { x: width / 2, y: height / 2 },
  }
}

export function calcDis(x, y, x1, y1) {
  const w_dx = Math.abs(x - x1)
  const w_dy = Math.abs(y - y1)
  return Math.sqrt(Math.pow(w_dx, 2) + Math.pow(w_dy, 2))
}

// 弧度转角度
export function arcToDeg(arc: number, type, objectId) {
  const deg = (180 / Math.PI) * arc + 90
  // console.log(objectId + type, deg)
  return deg
}

export const iconMap = {
  0: 'marker',
  1: 'marker',
  2: 'people',
  3: 'marker',
  4: 'marker',
  5: 'marker',
  6: 'marker',
  7: 'marker',
  8: 'marker',
  9: 'marker',
  10: 'marker',
  11: 'marker',
  12: 'marker',
  13: 'marker',
  14: 'marker',
  15: 'marker',
  16: 'marker',
  17: 'marker',
  18: 'marker',
  19: 'bike',
  20: 'motor',
  21: 'car',
  22: 'truck', // 卡车
  23: 'bus',
  24: 'small-truck', // 小型货车
  25: 'long-truck', // 长货车
  26: 'trike', // 三轮车
  27: 'ambulance',
  28: 'fire-truck',
  29: 'police-car',
}

export const directionIcon = [2, 19, 20, 21, 22, 23, 24, 25, 26]

export const showIcon = [...directionIcon]
