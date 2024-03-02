
/**
 * 比例计算 AspectRatio
 * @param w 
 * @param h 
 * @param accuracy 
 * @returns 
 */
export function RatioCalculation(w: number, h: number, accuracy: number) {
    return Math.round((w/h) * accuracy)
}

/**
 * 比例换算 AspectRatio
 * @param w 
 * @param h 
 * @param accuracy 
 * @returns 
 */
export function RatioConversion(value: number, ratio: number, accuracy: number) {
    return Math.round((value * ratio) / accuracy)
}

/**
 * 两点直接的距离
 * @param w 
 * @param h 
 * @param accuracy 
 * @returns 
 */
export function Point2Distance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(( ( (p1.x-p2.x)*(p1.x-p2.x) ) + ( (p1.y-p2.y)*(p1.y-p2.y) ) ))
}


// 模拟移动端e.offsetX,e.offsetY
export function getVertexPosition(el) {
    let currentTarget = el
    let top = 0
    let left = 0
    while (currentTarget !== null) {
        top += currentTarget.offsetTop
        left += currentTarget.offsetLeft
        currentTarget = currentTarget.offsetParent
    }
    return { top, left }
}
