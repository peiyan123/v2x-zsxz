import { AiMarkInterface, Point } from '..'
import { RatioConversion } from '../util'
import { Font } from '../font'
import { filter } from 'rxjs/operators'

/**
 * PointAllDrawDecorators
 */
export function PointAllDrawDecorators<T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {
    points: Point[] = []
    pointsMap: Map<string, Point[]> = new Map<string, Point[]>()

    /**
     * @override 方法重写 super.init
     * @param el
     * @param url
     * @param args
     */
    init(el: HTMLElement, ...args: any[]): any {
      let result = super.init(el, ...args)
      // 绘制点的功能
      this.drawPoint()
      return { ...result }
    }

    /**
     * 绘制点
     * @param element
     */
    drawPoint() {
      this.destroy.push(
        this.imageChangeEvent?.pipe(filter((s) => s === 'drag')).subscribe(() => {
          const updatePointPosition = (point: Point) => {
            point.x = RatioConversion(point.source.x!, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x
            point.y = RatioConversion(point.source.y!, this.canvasZoom, this.accuracy) + this.imageStartPoint!.y
          }
          this.points?.forEach(updatePointPosition)
          this.pointsMap?.forEach((points) => points?.forEach(updatePointPosition))
        })
      )
      this.canvasOperation((ctx: CanvasRenderingContext2D) => {
        this.fontsMap?.delete('point-fonts')
        const drawCross = (point: Point) => {
          const w = 25
          ctx.beginPath()
          ctx.lineWidth = 1
          ctx.moveTo(point.x - w / 2, point.y)
          ctx.lineTo(point.x + w / 2, point.y)
          ctx.moveTo(point.x, point.y - w / 2)
          ctx.lineTo(point.x, point.y + w / 2)
          ctx.strokeStyle = point.source.color
          ctx.setLineDash([0])
          ctx.stroke()
        }
        const fonts: Font[] = [],
          drawPoint = (point: Point) => {
            point.x = RatioConversion(point.source.x!, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x
            point.y = RatioConversion(point.source.y!, this.canvasZoom, this.accuracy) + this.imageStartPoint!.y
            if (point.invalid && this.cross) {
              drawCross(point)
              return
            } else if (point.invalid) {
              return
            }
            ctx.setLineDash([0])
            ctx.beginPath() //开始绘制
            // 设置绘制颜色
            ctx.strokeStyle = point.source.labelColor! // 框
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2, true)
            ctx.fill() //开始填充
            ctx.fillStyle = point.source.color! // 区域
            ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2, true)
            ctx.fill() //开始填充
            if (this.cross) {
              drawCross(point)
            }

            if (point.source.label) {
              fonts.push({ point, backgroundColor: `rgba( ${point.source.color!.split('(')[1].split(')')[0]} ,.3)` })
            }
          }

        this.points?.forEach(drawPoint)
        this.pointsMap?.forEach((points) => points?.forEach(drawPoint))
        this.fontsMap?.set('point-fonts', fonts)
      })
    }
  }
}
