import { AiMarkInterface } from '..';
import { fromEvent, Subject } from 'rxjs';
import { Point } from '../point/index';
import { RatioCalculation } from '../util/shape-calculation';
import { ShapeDetectionData } from './index';
import { filter } from 'rxjs/operators';

/**
 * ShapeDetectionDecorators
 */

export function ShapeDetectionDecorators <T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {
    /**
     * 对象集合
     */
    shapeDetections?: ShapeDetectionData[] = []

    /**
     * 正在绘制的矩形
     */
    shapeDetectionDrawing: ShapeDetectionData | null = null

    /**
     * 点结束移动事件
     */
    shapeDetectionCreateSuccess?: Subject<ShapeDetectionData> = new Subject<ShapeDetectionData>()

    /**
     * 矩形绘制 参数 (非空则开启绘制功能)
     */
    shapeDetectionSource: ShapeDetectionData | null = null

    /**
     * @override 方法重写 super.init
     * @param el 
     * @param url 
     * @param args 
     */
    init(el: HTMLElement, ...args: any[]): any {
      let result = super.init(el, ...args)
      this.shapeHoverBackground = true
      // 绘制矩形点
      this.drawShapeDetection()
      return {...result}
    }

    /**
     * 进入绘制模式：画点
     * @param rules 
     */
    shapeDetectionDrawOption(option: ShapeDetectionData) {
      // 计算 labelCole
      option.labelColor = this.getLabelCole!(option.color!)
      // 创建当前图形
      this.shapeDetectionSource = option
    }

    /**
     * 绘制矩形
     * @param element 
     */
    drawShapeDetection() {
      // 所有图形都设为可选的
      this.shapeSelectPlan = this.shapeDetections
      // 鼠标左键按下
      this.destroy.push(
        this.canvasElementEvents!.mousedown.pipe(filter((event: any) => event.button === 0)).subscribe((e): any => {
          // 矩形Hover
          if (this.pointHover) return
          // 矩形绘制 参数
          if (!this.shapeDetectionSource) return
          // 点在图片上的判断
          if (!this.imageRangeOnXY!(e.offsetX, e.offsetY)) return
          // 绘制开始点
          let startPoint: Point = {
            id: Symbol('PointId'),
            x: e.offsetX, 
            y: e.offsetY,
            source: {
              color: this.shapeDetectionSource.color,
              labelColor: this.shapeDetectionSource.labelColor,
              x: RatioCalculation((e.offsetX - this.imageStartPoint!.x), this.canvasZoom, this.accuracy),
              y: RatioCalculation((e.offsetY - this.imageStartPoint!.y), this.canvasZoom, this.accuracy),
            }
          }
          this.shapeDetectionDrawing = {
            shapeId: 'shapDetection:' + (new Date()).getTime() + Math.round(Math.random() * 10000),
            ...this.shapeDetectionSource,
            startPoint
          }
          this.shapeSelected = this.shapeDetectionDrawing
        })
      )
      // 鼠标左键按下 拖动 绘制矩形
      this.destroy.push(
        this.canvasElementEvents!.mousemove.subscribe(e => {
          // 正在绘制的矩形
          if (!this.shapeDetectionDrawing) return
          // 点在图片上的判断
          if (!this.imageRangeOnXY!(e.offsetX, e.offsetY)) return
          // 绘制结束点
          let endPint: Point = {
            id: Symbol('PointId'),
            x: e.offsetX,
            y: e.offsetY,
            source: {
              ...this.shapeDetectionDrawing.startPoint?.source,
              x: RatioCalculation((e.offsetX - this.imageStartPoint!.x), this.canvasZoom, this.accuracy),
              y: RatioCalculation((e.offsetY - this.imageStartPoint!.y), this.canvasZoom, this.accuracy),
            }
          }
          Object.assign(this.shapeDetectionDrawing, {
            endPint,
            point: [
              this.shapeDetectionDrawing.startPoint!, {
                id: Symbol('PointId'), x: endPint.x!, y: this.shapeDetectionDrawing.startPoint!.y!,
                source: {
                  ...this.shapeDetectionDrawing.startPoint?.source,
                  x: endPint!.source.x!, y: this.shapeDetectionDrawing.startPoint!.source.y!
                }
              }, endPint, {
                id: Symbol('PointId'), x: this.shapeDetectionDrawing.startPoint!.x!, y: endPint.y!,
                source: {
                  ...this.shapeDetectionDrawing.startPoint?.source,
                  x: this.shapeDetectionDrawing.startPoint!.source.x!, y: endPint!.source.y!
                }
              }
            ]
          })
          this.points = this.shapeDetectionDrawing.point
        })
      )
      // 鼠标左键抬起 矩形绘制完成
      this.destroy.push(
        fromEvent(window, 'mouseup').subscribe(() => {
          if (this.shapeDetectionDrawing) {
            // 矩形 最长边 小于 10px 则忽略
            if (
              ((this.shapeDetectionDrawing.maxX! - this.shapeDetectionDrawing.minX!) > 10) ||
              ((this.shapeDetectionDrawing.maxY! - this.shapeDetectionDrawing.minY!) > 10)
            ) {
              this.shapeDetections?.push(this.shapeDetectionDrawing)
              this.shapeDetectionCreateSuccess?.next(this.shapeDetectionDrawing)
            } else {
              this.shapeSelected = null
              this.points = []
              this.pointSelectedPlan = []
              this.pointDragPlan = []
            }
          }
          this.shapeDetectionDrawing = null
        })
      )
    }
  }
}

