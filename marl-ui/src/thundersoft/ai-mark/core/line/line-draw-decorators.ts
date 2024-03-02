import { AiMarkInterface, Line, LineConfig } from '..'
import { RatioConversion, RatioCalculation } from '../util'
/**
 * LineDrawDecorators
 */

export function LineDrawDecorators(lineConfig: LineConfig) {
  return function <T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
    return class extends constructor {
      lines: Line[] = []
      linesMap: Map<string, Line[]> = new Map<string, Line[]>()

      /**
       * @override 方法重写 super.init
       * @param el
       * @param url
       * @param args
       */
      init(el: HTMLElement, ...args: any[]): any {
        let result = super.init(el, ...args)
        // 开启绘制线的功能
        this.lineDraw()
        return { ...result }
      }

      /**
       * 画线
       * @param element
       */
      lineDraw() {
     
        this.canvasOperation((ctx: CanvasRenderingContext2D) => {
          const lineDraw = (line: Line) => {
                        
            if (!line.start || !line.end) return
            const lineType = line.end.source.lineType
            const config = {
              ...lineConfig,
              ...line.config,
            }

            if (lineType == 'arrow') {
              const fromX = line.start.x
              const fromY = line.start.y
              const toX = line.end.x
              const toY = line.end.y

              var headlen = 10 //自定义箭头线的长度
              var theta = 45 //自定义箭头线与直线的夹角，个人觉得45°刚刚好
              var arrowX, arrowY //箭头线终点坐标
              // 计算各角度和对应的箭头终点坐标
              var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI
              var angle1 = ((angle + theta) * Math.PI) / 180
              var angle2 = ((angle - theta) * Math.PI) / 180
              var topX = headlen * Math.cos(angle1)
              var topY = headlen * Math.sin(angle1)
              var botX = headlen * Math.cos(angle2)
              var botY = headlen * Math.sin(angle2)
              ctx.restore()
              ctx.beginPath()
              //画直线
              ctx.moveTo(fromX, fromY)
              ctx.lineTo(toX, toY)

              arrowX = toX + topX
              arrowY = toY + topY
              //画上边箭头线
              ctx.moveTo(arrowX, arrowY)
              ctx.lineTo(toX, toY)

              arrowX = toX + botX
              arrowY = toY + botY
              //画下边箭头线
              ctx.lineTo(arrowX, arrowY)

              ctx.setLineDash([config!.dash!]) // 0实线
              ctx.lineWidth = config!.width!
              ctx.strokeStyle = config!.color!
              ctx.stroke()
            } else {
                // 实线/虚线
              ctx.setLineDash([config!.dash!])
              // 颜色
              ctx.strokeStyle = config!.color!
              // 宽度
              ctx.lineWidth = config!.width!
              ctx.beginPath()
              // RatioConversion(point[0].source.x, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x TODO lgj
              const startX = line.start.x
              const startY = line.start.y
              const endX = line.end.x
              const endY = line.end.y
              ctx.moveTo(startX,startY)
              ctx.lineTo(endX, endY)
              ctx.stroke()
            }
          }
          this.lines.forEach(lineDraw)
          this.linesMap.forEach((lines) => lines.forEach(lineDraw))
        })
      }
    }
  }
}
