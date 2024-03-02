import { fromEvent, Subject, Subscription } from 'rxjs'
import {
  AiMarkInterface,
  MarkCanvasBaseClass,
  MarkShapeSegmentationDecorators,
  Shape,
  ShapeSegmentationData,
} from '../core'
// enum
import { LaneOperation } from '@/core/enums/markEnum'
import { SceneDecorators } from './scene-decorators'

// 如果是同一图片，则联动显示
let imageId: any = '',
  aimarkArray: AiMarkInterface[] = [],
  eventSubject: (Subscription | undefined)[] = [],
  imageChange = (url: any, aimark: AiMarkInterface) => {
    imageId = url
    // console.log('ai mark => imageChange', url, aimark)
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

@MarkShapeSegmentationDecorators
class AiMark extends MarkCanvasBaseClass {}
@SceneDecorators
export class SegmentationScene3 {
  // 画布对象
  markCanvas: AiMarkInterface | any = new AiMark()

  // 创建新标注的配置
  curShapeCreateCofig: ShapeSegmentationData | null = null

  /**
   * 对象删除事件
   */
  deleteShapeEvent: Subject<Shape> = new Subject<Shape>()

  /**
   * 对象选中事件
   */
  selectShapeEvent: Subject<Shape> = new Subject<Shape>()

  destroyEvent: (Subscription | undefined)[] = []

  constructor(el: HTMLElement, url?: string, markData: ShapeSegmentationData[] = []) {
    if (imageId === url && aimarkArray.length === 1) {
      imageCopy(this.markCanvas)
    } else {
      imageChange(url, this.markCanvas)
    }
    this.markCanvas.destroyMap.set('scene', this.destroyEvent)
    this.markCanvas.init(el, url)
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
    // 新标注对象 绘制点事件
    this.destroyEvent.push(
      this.markCanvas.shapeSegmentationDrawAddEvent?.subscribe((d) => {
        // 所有图形都设为 不可选的
        this.markCanvas.shapeSelectPlan = []
        this.markCanvas.shapeHover = null
        // // 关闭对 双击事件 的过滤
        // this.markCanvas.pointsCreateDBClickOrClick = false
      })
    )
    // 新标注对象 绘制成功
    this.destroyEvent.push(
      this.markCanvas.shapeSegmentationDrawEndEvent?.subscribe((d) => {
        // 所有图形都设为 可选的
        this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
        // // 开启对 双击事件 的过滤
        // this.markCanvas.pointsCreateDBClickOrClick = true
        if (this.curShapeCreateCofig) {
          this.openMarkMode(this.curShapeCreateCofig)
        }
      })
    )
    // 对象选中之前 先保存当前编辑的对象
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedBeforeEvent?.subscribe(() => {
        this.markModeSave()
      })
    )
    // 对象选中之后 进入对象编辑模式
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedAfterEvent?.subscribe((shape) => {
        // this.markCanvas.shapeSelectPlan = [shape]
        this.markForShape(shape)
        // 对象选中后触发注册事件
        this.selectShapeEvent.next(shape)
      })
    )
    // 退出对象选中
    this.markCanvas.shapeSelectedExitKeyEsc = true
    this.markCanvas.shapeSelectedExitClick = true
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedExitBeforeEvent?.subscribe((shape) => {
        if (
          shape === this.markCanvas.currentShapeSegmentation ||
          (+shape.type === +this.markCanvas.currentShapeSegmentation.type &&
            shape.name === this.markCanvas.currentShapeSegmentation.name)
        ) {
          this.markCanvas.pointClearDoing!()
          this.markCanvas.pointSource = null
          this.markCanvas.points = []
          // 如果this.markCanvas.currentShapeSegmentation的点为空，则设置shape的点不突出显示
          if (this.markCanvas.currentShapeSegmentation.point.length === 0) {
            shape.point?.forEach((p) => (p.invalid = true))
          }
          // 清空当前编辑的对象
          this.markCanvas.currentShapeSegmentation.point?.forEach((p) => (p.invalid = true))
          this.markCanvas.currentShapeSegmentation = null
        }
      })
    )
    // 退出对象选中之后
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedExitBeforeEvent?.subscribe(() => {
        setTimeout(() => {
          if (this.curShapeCreateCofig) {
            this.openMarkMode(this.curShapeCreateCofig)
          }
        })
      })
    )
    // 对象绘制成功之后，立刻 保存，开启新对象的绘制
    this.destroyEvent.push(
      this.markCanvas.shapeSegmentationDrawSuccessEvent?.subscribe((e) => {
        this.markModeSave()
        // 开启新对象的绘制
        this.markForShape(e.option)
      })
    )
    this.setData(markData)
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
  }

  destroy() {
    // 消除 上一次 init 订阅的事件
    this.markCanvas.destroyMap.forEach((ds) => ds.forEach((d) => d?.unsubscribe()))
    this.destroyEvent.forEach((d) => d?.unsubscribe())
  }
  // TODO lgj 删除一组车道图形
  deleteLane(type: string) {
    const selectLaneArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (item.type == type) return item
    })
    if (selectLaneArray.length) {
      selectLaneArray.forEach((shape, index) => {
        this.markCanvas.shapeSegmentations?.splice(this.markCanvas.shapeSegmentations?.indexOf(shape), 1)
        this.markCanvas.pointsMap?.delete(shape.shapeId!)
      })
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentShapeSegmentation?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
      this.markCanvas.pointClearDoing!()
      // 所有图形都设为 可选的
      this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
      if (this.curShapeCreateCofig) {
        this.openMarkMode(this.curShapeCreateCofig)
      }
    }
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    this.deleteSelected()
    this.closeMarkMode()
  }
  /**
   * 删除选中的对象或者点
   */
  deleteSelected() {
    // 删除已选择的点
    if (
      ((this.markCanvas.shapeSelected && this.markCanvas.shapeSelected.point!.length > 3) ||
        (!this.markCanvas.shapeSelected &&
          this.markCanvas.currentShapeSegmentation &&
          this.markCanvas.currentShapeSegmentation!.point!.length > 1)) &&
      this.markCanvas.pointSelected
    ) {
      const shape = this.markCanvas.shapeSelected || this.markCanvas.currentShapeSegmentation
      shape?.point?.splice(shape?.point?.indexOf(this.markCanvas.pointSelected), 1)
      this.markCanvas.pointHover = null
      this.markCanvas.pointSelected = null
      // 删除对象
    } else if (this.markCanvas.shapeSelected) {
      const shape = this.markCanvas.shapeSelected
      // 删除对象
      this.markCanvas.shapeSegmentations?.splice(this.markCanvas.shapeSegmentations?.indexOf(shape), 1)
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentShapeSegmentation?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
      // 删除点
      this.markCanvas.pointsMap?.delete(shape.shapeId!)
      this.markCanvas.pointClearDoing!()
      // 所有图形都设为 可选的
      this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
      if (this.curShapeCreateCofig) {
        this.openMarkMode(this.curShapeCreateCofig)
      }

      // 事件 通知
      this.deleteShapeEvent.next(shape)

      // 删除新对象
    } else if (this.markCanvas.currentShapeSegmentation) {
      const shape = this.markCanvas.currentShapeSegmentation
      // 删除对象
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentShapeSegmentation?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
      // 删除点
      this.markCanvas.pointsMap?.delete(shape.shapeId!)
      this.markCanvas.pointClearDoing!()
      // 所有图形都设为 可选的
      this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
      if (this.curShapeCreateCofig) {
        this.openMarkMode(this.curShapeCreateCofig)
      }
    }
  }
  /**
   * 载入 图片 + mark 标注数据
   * @param url
   */
  reload(url: string, markData: ShapeSegmentationData[]) {
    this.markCanvas.loadImage!(url)
    this.setData(markData)
  }
  changeImage(url) {
    this.markCanvas.loadImage!(url)
  }
  /**
   * 修改数据
   */
  setData(markData: ShapeSegmentationData[]) {
    this.markCanvas.pointClear!()
    this.markCanvas.lineClear!()
    this.markCanvas.shapeClear!()
    this.markCanvas.fillsMap?.clear()
    // 清空 点图标注 数据
    this.markCanvas.shapeSegmentations!.length = 0
    // 清空 当前标注的数据
    this.markCanvas.currentShapeSegmentation = null
    this.markCanvas.pointSource = null
    // 载入 标注数据
    this.markCanvas.loadShapeSegmentation!(markData)
    // 可选
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
  }
  /**
   * 获取数据
   */
  getData() {
    console.log(this.markCanvas.shapeSegmentations)

    return this.markCanvas.shapeSegmentations?.map((s) => ({
      color: s.color,
      type: Number(s.type),
      label: s.label,
      shapeId: s.shapeId,
      name: s.name,
      laneType: s.laneType,
      lanePosition: s.lanePosition,
      pointSource: JSON.parse(
        JSON.stringify(s.point?.map((p) => ({ x: p.source.x, y: p.source.y, lineType: p.source.lineType })))
      ),
      // 线类型
      lineType: s.lineType,
      // 实线描述
      lineDescription: s.lineDescription,
    }))
  }
  /**
   * 获取当前的模式
   */
  getModel(): string {
    if (
      this.markCanvas.currentShapeSegmentation &&
      this.markCanvas.currentShapeSegmentation === this.markCanvas.shapeSelected
    ) {
      // 对象编辑模式
      return 'edit'
    } else if (this.markCanvas.currentShapeSegmentation) {
      // 新对象的标注模式
      return 'create'
    } else if (this.markCanvas.shapeSelectPlan && this.markCanvas.shapeSelectPlan.length) {
      // 对象选择模式
      return 'select'
    } else {
      // 初始模式，啥都没有
      return 'init'
    }
  }
  /**
   * 获取当前选中的数据
   * @returns
   */
  getShapeSelected() {
    return this.markCanvas.shapeSelected
  }
  /**
   * 进入新对象的标注模式
   */
  openMarkMode(shapeCofig?: ShapeSegmentationData) {
    // 暂存配置信息
    if (shapeCofig) {
      this.curShapeCreateCofig = JSON.parse(JSON.stringify(shapeCofig))
    }
    // 所有图形都设为 可选的
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
    // 开启新对象的标注模式
    if (shapeCofig) {
      // 当前本来就处于 新对象的标注模式
      if (this.markCanvas.currentShapeSegmentation) {
        if (this.markCanvas.currentShapeSegmentation != this.markCanvas.shapeSelected) {
          if (this.markCanvas.currentShapeSegmentation.type == shapeCofig.type) {
            // return TODO lgj
          } else {
            this.markModeSave()
          }
        }
      }
      // 当前本来就处于 对象的编辑模式, 退出对象的编辑模式
      this.markCanvas.shapeSelected?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.shapeSelected = null
      this.markForShape(shapeCofig)
    }
  }
  /**
   * 关闭标注模式
   */
  closeMarkMode() {
    // 所有图形都设为 不可选的
    this.markCanvas.shapeSelectPlan = []
    this.markCanvas.shapeHoverPlan = this.markCanvas.shapeSegmentations
    // 取消当前选中的图形
    this.markCanvas.shapeSelected = null
    this.markCanvas.shapeHover = null
    // 取消当前 对点的操作
    this.markCanvas.pointClearDoing!()
    // 关闭 新对象的标注模式
    this.markCanvas.pointSource = null
    this.markCanvas.currentShapeSegmentation = null
    this.curShapeCreateCofig = null
  }
  /**
   * 清空待创建形状的配置信息
   */
  clearCreateConfi() {
    //  // 取消当前 对点的操作
    //  this.markCanvas.pointClearDoing!()
    // // 关闭 新对象的标注模式
    // this.markCanvas.pointSource = null
    // this.markCanvas.currentShapeSegmentation = null
    this.curShapeCreateCofig = null
  }
  /**
   * 对象标注
   */
  markForShape(shapeCofig: ShapeSegmentationData) {
    this.markCanvas.pointClearDoing!()
    // 配置标注规则
    this.markCanvas.shapeSegmentationDrawing!(shapeCofig)
  }
  /**
   * 保存
   */
  markModeSave() {
    if (this.markCanvas.currentShapeSegmentation) {
      // 不是编辑模式
      if (!this.markCanvas.shapeSegmentations?.includes(this.markCanvas.currentShapeSegmentation!)) {
        // 绘制完成的对象 保存， 没有绘制完成 则丢掉 不保存
        if (!this.markCanvas.pointSource) {
          this.markCanvas.shapeSegmentations?.push(this.markCanvas.currentShapeSegmentation!)
        }
        this.markCanvas.pointSource = null
        this.markCanvas.points = []
      }
      // 清空当前编辑的对象
      this.markCanvas.currentShapeSegmentation.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
    }
    // this.markCanvas.shapeSelected = null
  }
  /**
   * 复位
   */
  reset() {
    this.markCanvas.canvasZoomDefault!()
  }

  /**
   * 绘制形状
   * @param config 待绘制形状的配置
   */
  drawShape(config) {
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    if (!this.getShapeSelected()) this.deleteSelected()
    this.openMarkMode(config)
    let type = config.currentOperation
    if (config.currentOperation === 'direction') {
      type = 'arrow'
    } else if (config.currentOperation === 'area') {
      type = 'line'
    }
    this.markCanvas.lineTypeEvent.next({ operationName: config.name, laneName: config.type, type })
    const selectAreaArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (
        item.type == config.type &&
        (item.name == LaneOperation[config.currentOperation] || item.name === config.currentOperation)
      )
        return item
    })
    if (selectAreaArray.length) {
      this.markCanvas.shapeSelected = selectAreaArray[0]
      // 设置形状的点突出显示
      const selectedPoints = [...this.markCanvas.shapeSelected.point]
      selectedPoints.forEach((item) => (item.invalid = false))
      this.markCanvas.pointSelectedPlan = selectedPoints
      this.markCanvas.pointDragPlan = selectedPoints
    }
  }

  // 绘制箭头TODO
  drawArrow(config) {
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    if (!this.getShapeSelected()) this.deleteSelected()
    this.openMarkMode(config)
    this.markCanvas.lineTypeEvent.next({ operationName: config.name, laneName: config.type, type: 'arrow' })
    const selectAreaArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (item.type == config.type && item.name == LaneOperation['direction']) return item
    })
    if (selectAreaArray.length) {
      this.markCanvas.shapeSelected = selectAreaArray[0]
    }
  }
  // 绘制区域
  drawArea(config) {
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    if (!this.getShapeSelected()) this.deleteSelected()
    this.openMarkMode(config)
    this.markCanvas.lineTypeEvent.next({ operationName: config.name, laneName: config.type, type: 'line' })
    const selectAreaArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (item.type == config.type && item.name == LaneOperation['area']) return item
    })
    if (selectAreaArray.length) {
      this.markCanvas.shapeSelected = selectAreaArray[0]
    }
  }

  drawFlow(config) {
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    if (!this.getShapeSelected()) this.deleteSelected()
    this.openMarkMode(config)
    this.markCanvas.lineTypeEvent.next({ operationName: config.name, laneName: config.type, type: 'flow' })
    const selectAreaArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (item.type == config.type && item.name == LaneOperation['flow']) return item
    })
    if (selectAreaArray.length) {
      this.markCanvas.shapeSelected = selectAreaArray[0]
    }
  }
}

export default SegmentationScene3
