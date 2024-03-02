import { ShapeCrossData } from './shape-cross-model'
import { AiMarkInterface } from '..'
import { fromEvent, Subject, merge } from 'rxjs'
import { Point } from '../point/index'
import { RatioCalculation } from '../util/shape-calculation'
import { filter } from 'rxjs/operators'
import { Font } from '../font'
import { createId } from './utils'

export function ShapeCrossDecorators<T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {
    cross: boolean = true
    shapeCross: ShapeCrossData[] = []
    currentCross: ShapeCrossData
    shapeCrossDrawSuccessEvent: Subject<ShapeCrossData> = new Subject()

    /**
     * @override 方法重写 super.init
     * @param el
     * @param url
     * @param args
     */
    init(el: HTMLElement, ...args: any[]): any {
      let result = super.init(el, ...args)

      this.canvasOperation(() => {
        this.points = []
        this.shapeCross?.forEach((shape) => this.updateShapeMinMax!(shape, this.shapePeripheralDistance!))
        const fonts: Font[] = [],
          detectionsLine = (shape: ShapeCrossData, index: number) => {
            if (!shape.label) return
            // label font
            fonts.push({
              x: shape.minX + 15,
              y: shape.maxY - 15,
              label:
                shape.label +
                shape.id +
                (shape.lon ? `,经度:${shape.lon}` : '') +
                (shape.lat ? `,纬度:${shape.lat}` : ''),
              labelColor: shape.labelColor,
              backgroundColor: `rgba( ${shape.color!.split('(')[1].split(')')[0]} ,.3)`,
            })
          }
        // 图形数据绘制
        this.shapeCross?.forEach((det, index) => {
          // if ( (det === this.shapeSelected) ||  (det === this.shapeDetectionDrawing) ) {
          //   det?.point?.forEach(p => p.invalid = false)
          // } else {
          //   det?.point?.forEach(p => p.invalid = true)
          // }
          detectionsLine(det, index)
        })
        // console.log(this.shapeCross)

        this.fontsMap?.set('shape-cross-fonts', fonts)

        if (this.shapeSelected) {
          this.pointDragPlan = this.shapeSelected.point
        }
      })

      return { ...result }
    }

    shapeCrossDrawing(option: ShapeCrossData) {
      this.pointSource = null
      // 计算 labelCole
      option.labelColor = this.getLabelCole!(option.color!)
      // 创建当前图形
      if (option === this.shapeSelected) {
        this.currentCross = this.shapeSelected
      } else {
        this.currentCross = {
          ...option,
          // 点集合
          point: option.point || [],
          // 生成一个唯一Id
          shapeId: option.shapeId || 'shapPoint:' + new Date().getTime() + Math.round(Math.random() * 10000),
          // 绘制排序 以当前数据中最大递增 TODO lgj
          id: createId(this.shapeCross),
        }
        // 开启点的绘制
        this.pointSource = {
          color: option.color,
          labelColor: option.labelColor,
          shapeId: this.currentCross!.shapeId,
        }
      }

      // 点显示
      this.pointsMap?.set(this.currentCross!.shapeId!, this.currentCross!.point!)

      // this.currentCross.point?.forEach((p) => (p.invalid = true))
      // 点选择/点移动
      // this.pointDragPlan = this.pointSelectedPlan = this.currentCross.point
      // 点添加
      this.destroyMap.get('currentCross1')?.forEach((d) => d?.unsubscribe())
      this.destroyMap.set('currentCross1', [
        this.pointsCreateByMouseClickBeforeEvent!.subscribe((point) => {
          if (this.currentCross) {
            this.pointSelected = null
            point.invalid = true
            this.currentCross.point?.push(point)
            if (this.currentCross.point.length) {
              this.pointSource = null
              this.shapeCrossDrawSuccessEvent?.next({ option, shape: this.currentCross })
            }
          } else {
            // 无效的点
            point.invalid = true
          }
        }),
      ])
    }
  }
}
