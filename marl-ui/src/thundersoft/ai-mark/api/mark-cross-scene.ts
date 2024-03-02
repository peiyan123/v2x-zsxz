import { AiMarkInterface, MarkCanvasBaseClass, Shape } from '../core'
import { Subscription, Subject, fromEvent } from 'rxjs'
import { MarkShapeCrossDecorators } from '../core/shape-cross'
import { ShapeCrossData } from '../core/shape-cross/shape-cross-model'
import { some } from 'lodash'
import { SceneDecorators } from './scene-decorators'

// 如果是同一图片，则联动显示
let imageId: any = '',
  aimarkArray: AiMarkInterface[] = [],
  eventSubject: (Subscription | undefined)[] = [],
  imageChange = (url: any, aimark: AiMarkInterface) => {
    // console.log('ai mark => imageChange', url, aimark)
    imageId = url
    aimarkArray = [aimark]
    eventSubject.forEach((d) => d?.unsubscribe())
    eventSubject = []
  },
  imageCopy = (aimark: AiMarkInterface) => {
    // console.log('ai mark => imageCopy', aimark)
    eventSubject.push(
      aimark.imageChangeEvent!.subscribe((s) => {
        aimarkArray[0].imageStartPoint = aimark.imageStartPoint
        aimarkArray[0].canvasZoom = aimark.canvasZoom
      })
    )
    eventSubject.push(
      aimarkArray[0].imageChangeEvent!.subscribe((s) => {
        aimark.imageStartPoint = aimarkArray[0].imageStartPoint
        aimark.canvasZoom = aimarkArray[0].canvasZoom
      })
    )
    aimarkArray.push(aimark)
  }
@MarkShapeCrossDecorators
class AiMark extends MarkCanvasBaseClass {}

/**
 * 图片分类场景 ClassificationScene
 */
@SceneDecorators
export class MarkCrossScene {
  // 画布对象
  markCanvas: AiMarkInterface = new AiMark()

  destroyEvent: (Subscription | undefined)[] = []

  addShapeSuccessEvent: Subject<any> = new Subject()

  deleteShapeEvent: Subject<Shape> = new Subject<Shape>()

  curShapeCreateCofig

  constructor(el: HTMLElement, url: string) {
    if (imageId === url && aimarkArray.length === 1) {
      imageCopy(this.markCanvas)
    } else {
      imageChange(url, this.markCanvas)
    }
    this.markCanvas.init(el, url)

    this.destroyEvent.push(
      this.markCanvas.shapeCrossDrawSuccessEvent?.subscribe((e) => {
        this.markModeSave()
        // 开启新对象的绘制
        this.markForShape(e.option)
        this.addShapeSuccessEvent.next(this.markCanvas.shapeCross)
      })
    )
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedAfterEvent?.subscribe((e) => {
        this.markCanvas.shapeCross.forEach((a) => {
          a.point.forEach((b) => {
            b.invalid = true
          })
        })
        e.point.forEach((item) => {
          item.invalid = false
        })
      })
    )
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeCross
    this.markCanvas.shapeSelectedExitClick = true
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedExitBeforeEvent?.subscribe((e) => {
        e.point.forEach((item) => {
          item.invalid = true
        })
      })
    )

    // 监听键盘 删除键
    this.destroyEvent.push(
      fromEvent(document, 'keydown').subscribe((e: any) => {
        // backspace: 8   delete:46
        //@ts-ignore: isVisible是在装饰器中定义
        if (this.isVisible && (e.keyCode === 8 || e.keyCode === 46)) {
          // 删除选中的对象或者点
          this.deleteSelected()
        }
      })
    )
  }

  destroy() {
    // 消除 上一次 init 订阅的事件
    this.markCanvas.destroyMap.forEach((ds) => ds.forEach((d) => d?.unsubscribe()))
    this.destroyEvent.forEach((d) => d?.unsubscribe())
    this.markCanvas.destroy.forEach((d) => d?.unsubscribe())
  }

  deleteSelected() {
    if (this.markCanvas.shapeSelected) {
      const shape = this.markCanvas.shapeSelected
      // 删除对象
      this.markCanvas.shapeCross?.splice(this.markCanvas.shapeCross?.indexOf(shape), 1)
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentCross?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentCross = null
      // 删除点
      this.markCanvas.pointsMap?.delete(shape.shapeId!)
      this.markCanvas.pointClearDoing!()
      // 所有图形都设为 可选的
      this.markCanvas.shapeHoverPlan = this.markCanvas.shapeCross
      this.markCanvas.pointSource = null

      if (this.curShapeCreateCofig) {
        this.openMarkMode(this.curShapeCreateCofig)
      }
      this.deleteShapeEvent.next(this.markCanvas.shapeCross)

      // 删除新对象
    } else if (this.markCanvas.currentCross) {
      const shape = this.markCanvas.currentCross
      // 删除对象
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentCross?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentCross = null
      // 删除点
      this.markCanvas.pointsMap?.delete(shape.shapeId!)
      this.markCanvas.pointClearDoing!()
      // 所有图形都设为 可选的
      this.markCanvas.shapeHoverPlan = this.markCanvas.shapeCross

      this.markCanvas.pointSelectedPlan = []
      if (this.curShapeCreateCofig) {
        // this.openMarkMode(this.curShapeCreateCofig)
      }
      this.deleteShapeEvent.next(this.markCanvas.shapeCross)
    }
  }

  reload(url: string) {
    this.markCanvas.loadImage!(url)
  }

  openMarkMode(shapeConfig?: ShapeCrossData) {
    if (!this.curShapeCreateCofig) {
      this.curShapeCreateCofig = shapeConfig
    }
    this.markForShape(shapeConfig)
  }

  /**
   * 对象标注
   */
  markForShape(shapeCofig?: ShapeCrossData) {
    this.markCanvas.pointClearDoing!()
    // 配置标注规则
    this.markCanvas.shapeCrossDrawing!(shapeCofig)
    // 设置点可选
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeCross
  }
  /**
   * 关闭标注模式
   */
  clearMarkMode() {
    this.markCanvas.currentCross = null
    // 所有图形都设为 不可选的
    this.markCanvas.shapeSelectPlan = []
    // 取消当前选中的图形
    this.markCanvas.shapeSelected = null
    this.markCanvas.shapeHover = null
    // 取消所有选中的点
    this.markCanvas.shapeCross!.forEach((a) => {
      a.point.forEach((b) => {
        b.invalid = true
      })
    })
  }
  /**
   * 保存
   */
  markModeSave() {
    if (this.markCanvas.currentCross) {
      // 不是编辑模式
      if (!this.markCanvas.shapeCross?.includes(this.markCanvas.currentCross!)) {
        // 绘制完成的对象 保存， 没有绘制完成 则丢掉 不保存

        if (!this.markCanvas.pointSource) {
          this.markCanvas.shapeCross?.push(this.markCanvas.currentCross!)
        }
        this.markCanvas.pointSource = null
        this.markCanvas.points = []
      }
      // 清空当前编辑的对象
      // this.markCanvas.currentCross.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentCross = null
    }
    this.markCanvas.shapeSelected = null
  }

  /**
   * 获取数据
   */
  getData() {
    return this.markCanvas.shapeCross?.map((s) => ({
      id: s.id,
      pointSource: JSON.parse(JSON.stringify(s.point?.map((p) => ({ x: p.source.x, y: p.source.y })))),
      lon: Number(s.lon),
      lat: Number(s.lat),
      worldX: Number(s.worldX),
      worldY: Number(s.worldY),
      color: s.color,
      label: s.label,
      labelColor: s.labelColor,
      shapeId: s.shapeId,
    }))
  }

  /**
   * 修改数据
   */
  setData(markData: ShapeCrossData[]) {
    this.markCanvas.pointClear!()
    this.markCanvas.lineClear!()
    this.markCanvas.shapeClear!()
    this.markCanvas.fillsMap?.clear()
    // 清空 点图标注 数据
    this.markCanvas.shapeCross!.length = 0
    // 清空 当前标注的数据
    this.markCanvas.currentCross = null
    this.markCanvas.pointSource = null
    // 载入 标注数据
    this.markCanvas.loadShapeCross!(markData)
    // 可选
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeCross
  }

  changeImage(url) {
    this.markCanvas.loadImage!(url)
  }

  // 改变所有图形颜色
  changeAllShapeColor(data) {
    const errorColor = 'rgb(229, 243, 9)'
    const correctColor = 'rgb(255, 0, 0)'
    const errorData: any[] = data.invalid_points
    this.markCanvas.shapeCross.forEach((item) => {
      let isError = some(errorData, { img_x: item.point[0].source.x, img_y: item.point[0].source.y })
      if (isError) {
        item.color = errorColor
        item.labelColor = errorColor
        item.point[0].source.color = errorColor
      } else {
        item.color = correctColor
        item.labelColor = 'rgb(255, 255, 255)'
        item.point[0].source.color = correctColor
      }
    })
  }
  /**
   * 复位
   */
  reset() {
    this.markCanvas.canvasZoomDefault!()
  }
}

export default MarkCrossScene
