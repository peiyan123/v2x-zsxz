import { Subject } from 'rxjs'
import { AiMarkInterface, Point, PointSource } from '..'
import { RatioCalculation } from '../util'

/**
 * PointAllDrawDecorators
 */
export function PointCreateDecorators(pointConfig: PointSource) {
  return function <T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
    return class extends constructor {
      [x: string]: any

      /**
       * 鼠标左键点击添加点事件
       */
      pointsCreateByMouseClickBeforeEvent: Subject<Point> = new Subject<Point>()
      /**
       * 鼠标左键点击添加点, 是否区分双击
       */
      pointsCreateDBClickOrClickValue = true
      set pointsCreateDBClickOrClick(value: boolean) {
        this.pointsCreateDBClickOrClickChangeEventChangeEvent.next(value)
        this.pointsCreateDBClickOrClickValue = value
      }
      get pointsCreateDBClickOrClick() {
        return this.pointsCreateDBClickOrClickValue
      }
      /**
       * 鼠标左键点击添加点, 是否区分双击
       */
      pointsCreateDBClickOrClickChangeEventChangeEvent: Subject<boolean> = new Subject<boolean>()
      /**
       * 预定点的模式
       */
      pointDrawPlan?: PointSource[]
      /**
       * 点绘制的默认配置
       */
      pointSource?: PointSource | null

      /**
       * @override 方法重写 super.init
       * @param el
       * @param url
       * @param args
       */
      init(el: HTMLElement, ...args: any[]): any {
        let result = super.init(el, ...args)
        // 单击鼠标左键画点功能
        this.destroyMap.get('PointCreateDecorators')?.forEach((d) => d?.unsubscribe())
        this.destroyMap.set('PointCreateDecorators', [])
        this.pointsCreateByMouseClick()
        return { ...result }
      }

      /**
       * 鼠标左键单击添加点
       * @param element
       */
      pointsCreateByMouseClick() {
        // TODO lgj
        let currentLaneName = '' // 记录当前操作的路名
        let currentOperationName = '' // 记录当前操作的名称
        let currentAreaId = '' // 记录当前操作的检测区域
        this.destroy.push(
          this.lineTypeEvent.subscribe((type) => {
            this.lineType = type.type
            currentLaneName = type.laneName
            currentOperationName = type.operationName
          })
        )
        this.destroy.push(
          this.areaEvent.subscribe((id: string) => {
            currentAreaId = id
          })
        )
        // TODO lgj
        const createPoint = (e: any) => {
          if (this.maxSegmentationLength && this.shapeSegmentations.length >= this.maxSegmentationLength) return
          if (this.shapeSegmentations) {
            let bool = this.shapeSegmentations.some((item) => {
              return (item.type == currentLaneName && item.name == currentOperationName) || item.type == currentAreaId
            })
            if (bool) return
          }
          // TODO lgj 限制每条车道每个操作只能绘制一个
          // 当前存在 hover 点，则 不创建新点
          if (this.pointHover) return
          // 点在图片上的判断
          if (!this.imageRangeOnXY!(e.offsetX, e.offsetY)) return
          // 创建点：计划生产 方式，限量队列
          let point: Point | null = null
          if (this.pointDrawPlan && this.pointDrawPlan.length) {
            point = {
              id: Symbol('PointId'),
              x: e.offsetX,
              y: e.offsetY,
              source: {
                lineType: this.lineType,
                ...pointConfig,
                ...this.pointDrawPlan[0],
                x: RatioCalculation(e.offsetX - this.imageStartPoint!.x, this.canvasZoom, this.accuracy),
                y: RatioCalculation(e.offsetY - this.imageStartPoint!.y, this.canvasZoom, this.accuracy),
              },
            }
          }
          // 创建点：配置生产，不限量
          if (this.pointSource) {
            point = {
              id: Symbol('PointId'),
              x: e.offsetX,
              y: e.offsetY,
              source: {
                lineType: this.lineType,
                ...pointConfig,
                ...this.pointSource,
                x: RatioCalculation(e.offsetX - this.imageStartPoint!.x, this.canvasZoom, this.accuracy),
                y: RatioCalculation(e.offsetY - this.imageStartPoint!.y, this.canvasZoom, this.accuracy),
              },
            }
          }
          if (point) {
            if(this.cross&&!this.shapeSelected){
              this.pointsCreateByMouseClickBeforeEvent.next(point)
            }

            if(!this.cross){
              this.pointsCreateByMouseClickBeforeEvent.next(point)
            }
  
            if (!point.invalid) {
              // 有效点 hover
              this.pointHover = point
            }
          }
        }
        this.destroyMap.set('PointCreateDecorators', [this.canvasElementEvents?.leftSingleClick.subscribe(createPoint)])
        this.destroy.push(
          this.pointsCreateDBClickOrClickChangeEventChangeEvent.subscribe((model) => {
            this.destroyMap.get('PointCreateDecorators')?.forEach((d) => d?.unsubscribe())
            if (model) {
              // 过滤 双击事件
              this.destroyMap.set('PointCreateDecorators', [
                this.canvasElementEvents?.leftSingleClick.subscribe(createPoint),
              ])
            } else {
              // 不过滤 双击事件
              this.destroyMap.set('PointCreateDecorators', [this.canvasElementEvents?.click.subscribe(createPoint)])
            }
          })
        )
      }
    }
  }
}
