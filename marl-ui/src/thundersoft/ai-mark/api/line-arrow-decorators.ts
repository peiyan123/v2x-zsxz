import { filter } from 'rxjs/operators'
import { Shape, ShapePointData } from '..'
import { RatioConversion, RatioCalculation } from '../core/util'
export function LineArrowDecorators<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    arrowArr: any[] = []
    arrowMap: any = new Map()
    arrowStop: boolean = true
    drawArrowInit() {
      this.draw()

      this.canvasElementEvents.leftSingleClick.subscribe((e: MouseEvent) => {
        
        if (this.arrowStop || this.shapeSelected) return

        const [x, y] = [e.offsetX, e.offsetY]
        if (this.imageRangeOnXY(x, y)) {
          this.arrowArr.push({
            x,
            y,
            source: {
              x: RatioCalculation(x - this.imageStartPoint!.x, this.canvasZoom, this.accuracy),
              y: RatioCalculation(y - this.imageStartPoint!.y, this.canvasZoom, this.accuracy),
            },
          })
        }
        if (this.arrowArr.length === 2) {
          const shapeId = 'shapeArrow:' + new Date().getTime() + Math.round(Math.random() * 10000)

          // 画箭头
          const cloneArrowArr = this.cloneDeep(this.arrowArr)
          this.arrowMap.set(shapeId, cloneArrowArr)

          // 将已有的箭头加入shapeHoverPlan   shapeHover

          const shape: Shape = {
            color: 'rgb(194.5,169.5,80.25)',
            point: [
              {
                id: Symbol(),
                invalid: true,
                x: cloneArrowArr[0].x,
                y: cloneArrowArr[0].y,
                source: { x: cloneArrowArr[0].source.x, y: cloneArrowArr[0].source.y, shapeId },
              },
              {
                id: Symbol(),
                invalid: true,
                x: cloneArrowArr[1].x,
                y: cloneArrowArr[1].y,
                source: { x: cloneArrowArr[1].source.x, y: cloneArrowArr[1].source.y, shapeId },
              },
            ],
            shapeId: shapeId,
          }

          this.shapeHoverPlan.push(shape)
          this.shapeSelectPlan.push(shape)
          this.arrowArr = []
        }
      })

      this.imageChangeEvent?.pipe(filter((s) => s === 'drag' || s === 'zoom')).subscribe((e: string) => {
        const updatePointPosition = (point: Array<any>) => {
          point[0].x = RatioConversion(point[0].source.x, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x
          point[0].y = RatioConversion(point[0].source.y, this.canvasZoom, this.accuracy) + this.imageStartPoint!.y
          point[1].x = RatioConversion(point[1].source.x, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x
          point[1].y = RatioConversion(point[1].source.y, this.canvasZoom, this.accuracy) + this.imageStartPoint!.y
        }
        this.arrowMap.forEach((line: any) => {
          updatePointPosition(line)
        })
      })
    }

    draw() {
      this.canvasOperation((ctx: CanvasRenderingContext2D) => {
        const lineDraw = (line: Array<any>) => {
          if (!line[0].x || !line[0].y || !line[1].x || !line[1].y) return
          const fromX = line[0].x
          const fromY = line[0].y
          const toX = line[1].x
          const toY = line[1].y

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

          ctx.setLineDash([0])
          ctx.lineWidth = 1
          ctx.strokeStyle = '#ff0000'
          ctx.stroke()
        }
        this.arrowMap.forEach((line: any) => {
          lineDraw(line)
        })
      })
    }

    stopDrawArrow() {
      this.arrowStop = true
      this.arrowArr = []
    }

    startDrawArrow() {
      this.arrowStop = false
    }

    cloneDeep(val: any) {
      return JSON.parse(JSON.stringify(val))
    }
    loadArrowData(shape: ShapePointData[]) {
      shape.forEach((shapConfig: ShapePointData) => {
        const config: any = {}
        // 图形id
        config.shapeId = shapConfig.shapeId || 'shapArrow:' + new Date().getTime() + Math.round(Math.random() * 10000)
        // 加载图形的点
        config.point = shapConfig.pointSource!.map((source) => ({
          id: Symbol(),
          source: {
            ...source,
            shapeId: config.shapeId,
          },
          invalid: true,
        }))
        config.color = 'rgb(194.5,169.5,80.25)'
        this.arrowMap.set(config.shapeId, config.point)
        this.shapeHoverPlan.push(config)
        this.shapeSelectPlan.push(config)
      })
    }
  }
}
