import { fromEvent, Subject, Subscription } from 'rxjs'
import {
  AiMarkInterface,
  MarkCanvasBaseClass,
  MarkShapeSegmentationDecorators,
  Shape,
  ShapeSegmentationData,
} from '../core'
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
export class SegmentationScene {
  // 画布对象
  markCanvas: AiMarkInterface = new AiMark()

  // 创建新标注的配置
  curShapeCreateCofig: ShapeSegmentationData | null = null

  /**
   * 对象删除事件
   */
  deleteShapeEvent: Subject<Shape> = new Subject<Shape>()
  /**
   * 对象保存事件
   */
  saveShapeEvent: Subject<Shape> = new Subject<Shape>()

  /**
   * 对象选中事件
   */
  selectShapeEvent: Subject<Shape> = new Subject<Shape>()
  /**
   * 点拖动结束事件
   */
  pointDragEndEvent: Subject<Shape> = new Subject<Shape>()

  destroyEvent: (Subscription | undefined)[] = []

  constructor(el: HTMLElement, url?: string, markData: ShapeSegmentationData[] = []) {
    if (imageId === url && aimarkArray.length === 1) {
      imageCopy(this.markCanvas)
    } else {
      imageChange(url, this.markCanvas)
    }
    this.markCanvas.destroyMap.set('scene', this.destroyEvent)
    this.markCanvas.init(el, url)
    // // 监听键盘 删除键
    // this.destroyEvent.push(
    //   fromEvent(document, 'keydown').subscribe((e: any) => {
    //     // backspace: 8   delete:46
    //     if (e.keyCode === 8 || e.keyCode === 46) {
    //       // 删除选中的对象或者点
    //       this.deleteSelected()
    //     }
    //   })
    // )
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
        this.selectShapeEvent.next(shape)
      })
    )
    // 退出对象选中
    this.markCanvas.shapeSelectedExitKeyEsc = true
    this.markCanvas.shapeSelectedExitClick = true
    this.destroyEvent.push(
      this.markCanvas.shapeSelectedExitBeforeEvent?.subscribe((shape) => {
        if (Array.isArray(shape)) {
          shape.map((item) => {
            this.clearSelectedShape(item)
          })
          // 取消突出显示的点
          this.setPointInvalid()
        } else {
          this.clearSelectedShape(shape)
        }
        // if (shape === this.markCanvas.currentShapeSegmentation) {
        //   this.markCanvas.pointClearDoing!()
        //   this.markCanvas.pointSource = null
        //   this.markCanvas.points = []
        //   // 清空当前编辑的对象
        //   this.markCanvas.currentShapeSegmentation.point?.forEach((p) => (p.invalid = true))
        //   this.markCanvas.currentShapeSegmentation = null
        //   console.log('!!!!!!!!!!!!!!!')
        // }
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
    this.destroyEvent.push(
      // 点拖动结束后，找到拖动的形状，并发送事件
      this.markCanvas.pointDragEndEvent?.subscribe((e) => {
        const changeShape = this.getEventData()?.find((item) => item.shapeId === e.source.shapeId)
        if (changeShape) {
          this.pointDragEndEvent.next(changeShape)
        }
      })
    )
    this.setData(markData)
    this.markCanvas.shapeSelectPlan = this.markCanvas.shapeSegmentations
  }

  clearSelectedShape(shape) {
    if (
      shape === this.markCanvas.currentShapeSegmentation ||
      shape.type === this.markCanvas.currentShapeSegmentation?.type
    ) {
      this.markCanvas.pointClearDoing!()
      this.markCanvas.pointSource = null
      this.markCanvas.points = []
      // 清空当前编辑的对象
      this.markCanvas.currentShapeSegmentation?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
    }
  }

  destroy() {
    // 消除 上一次 init 订阅的事件
    this.markCanvas.destroyMap.forEach((ds) => ds.forEach((d) => d?.unsubscribe()))
    this.destroyEvent.forEach((d) => d?.unsubscribe())
  }
  /**
   * 删除选中的对象或者点
   */

  deleteDetectionArea(type: string) {
    const selectAreaArray = this.markCanvas.shapeSegmentations.filter((item) => {
      if (item.type == type) return item
    })
    if (selectAreaArray.length) {
      selectAreaArray.forEach((shape, index) => {
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
      // if (this.curShapeCreateCofig) {
      //   this.openMarkMode(this.curShapeCreateCofig)
      // }
    }
    // TODOlgj 没有确认完成绘制图形点击左侧面板删除图形
    this.deleteSelected()
    this.closeMarkMode()
  }
  /**
   * 绑定监听事件（这个方法单独提出来不放在构造函数中，因为放在构造函数时，deleteSelected()中的this.markCanvas.shapeSegmentations?.indexOf(item)找不到）
   */
  bindEvent() {
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

  deleteSelected() {
    // 删除已选择的点
    if (
      this.markCanvas.pointSelected &&
      ((this.markCanvas.shapeSelected && this.markCanvas.shapeSelected.point!.length > 3) ||
        (!this.markCanvas.shapeSelected &&
          this.markCanvas.currentShapeSegmentation &&
          this.markCanvas.currentShapeSegmentation!.point!.length > 1))
    ) {
      const shape = this.markCanvas.shapeSelected || this.markCanvas.currentShapeSegmentation
      shape?.point?.splice(shape?.point?.indexOf(this.markCanvas.pointSelected), 1)
      this.markCanvas.pointHover = null
      this.markCanvas.pointSelected = null
      // 删除对象
    } else if (this.markCanvas.shapeSelected) {
      let shape = this.markCanvas.shapeSelected
      if (!Array.isArray(shape)) {
        shape = [shape]
      }
      shape.forEach((item) => {
        this.markCanvas.shapeSegmentations?.splice(this.markCanvas.shapeSegmentations?.indexOf(item), 1)
        // 删除点
        this.markCanvas.pointsMap?.delete(item.shapeId!)
      })
      // // 删除对象
      // this.markCanvas.shapeSegmentations?.splice(this.markCanvas.shapeSegmentations?.indexOf(shape), 1)
      this.markCanvas.shapeSelected = null
      this.markCanvas.shapeHover = null
      this.markCanvas.currentShapeSegmentation?.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
      // 删除点
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
    return this.markCanvas.shapeSegmentations?.map((s) => ({
      color: s.color,
      type: s.type,
      label: s.label,
      shapeId: s.shapeId,
      pointSource: JSON.parse(JSON.stringify(s.point?.map((p) => ({ x: p.source.x, y: p.source.y })))),
    }))
  }
  /**
   * 获取事件区域数据
   */
  getEventData() {
    return this.markCanvas.shapeSegmentations?.map((s) => ({
      color: s.color,
      type: s.type,
      label: s.label,
      shapeId: s.shapeId,
      pointSource: JSON.parse(JSON.stringify(s.point?.map((p) => ({ x: p.source.x, y: p.source.y })))),
      propertyId: s.propertyId,
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
            return
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
   * 关闭新对象的标注模式，主要在事件区域配置标注中使用
   */
  closeMarkShape() {
    // // 关闭 新对象的标注模式（currentShapeSegmentation不能设置为null，否则事件区域配置标注页面切换属性的形状时，会导致取消选中形状的点不会取消突出显示，因此注释下面两行代码，并且这两行代码对整个函数的功能没有实际作用）
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
          // 组装形状数据，并发送事件
          let shapeTemp: any = {
            color: this.markCanvas.currentShapeSegmentation.color,
            type: this.markCanvas.currentShapeSegmentation.type,
            label: this.markCanvas.currentShapeSegmentation.label,
            shapeId: this.markCanvas.currentShapeSegmentation.shapeId,
            pointSource: JSON.parse(
              JSON.stringify(
                this.markCanvas.currentShapeSegmentation.point?.map((p) => ({ x: p.source.x, y: p.source.y }))
              )
            ),
            propertyId: this.markCanvas.currentShapeSegmentation.propertyId,
          }
          this.saveShapeEvent.next(shapeTemp)
        }
        this.markCanvas.pointSource = null
        this.markCanvas.points = []
      }
      // 清空当前编辑的对象
      this.markCanvas.currentShapeSegmentation.point?.forEach((p) => (p.invalid = true))
      this.markCanvas.currentShapeSegmentation = null
    }
    // 取消突出显示的点
    this.setPointInvalid()
    this.markCanvas.shapeSelected = null
  }
  /**
   * 复位
   */
  reset() {
    this.markCanvas.canvasZoomDefault!()
  }
  // TODO lgj 限制最大个数
  setMaxLength(length: number) {
    this.markCanvas.maxSegmentationLength = length
  }
  // TODO lgj
  drawDetectionArea(config) {
    let configArrTemp = config
    // 如果非数组，则转换为数组
    if (!Array.isArray(config)) {
      configArrTemp = [config]
    }
    // 取数组第一个元素作为下面的方法的参数
    if (configArrTemp.length > 0) {
      this.openMarkMode(configArrTemp[0])
      this.markCanvas.areaEvent.next(configArrTemp[0].type)
    } else {
      // 如果config参数为空数组，则取消突出显示的点，主要是事件区域配置中会进入这个逻辑
      this.setPointInvalid()
    }
    // 找到所有选中形状的数据
    this.markCanvas.shapeSelected = this.markCanvas.shapeSegmentations.filter((item) => {
      // if (item.type == config.type) return item
      if (configArrTemp.find((configItem) => configItem.type === item.type)) return item
    })
    // 设置选中的形状的点都突出显示
    let selectedPoints: any = []
    this.markCanvas.shapeSelected.map((item) => {
      selectedPoints = [...selectedPoints, ...item.point]
    })
    selectedPoints.forEach((item) => (item.invalid = false))
    this.markCanvas.pointSelectedPlan = selectedPoints
    this.markCanvas.pointDragPlan = selectedPoints
    // if (selectAreaArray.length) {
    //   this.markCanvas.shapeSelected = selectAreaArray[0]
    // }
  }

  /**
   * 设置选中形状的点的invalid属性为true，即取消突出显示点
   */
  setPointInvalid() {
    // 如果shapeSelected是数组，则对每个形状的点做设置
    if (Array.isArray(this.markCanvas.shapeSelected)) {
      this.markCanvas.shapeSelected.map((item) => {
        item.point?.forEach((p) => (p.invalid = true))
      })
    } else {
      // shapeSelected是一个形状，则直接对其点做设置
      this.markCanvas.shapeSelected?.point?.forEach((p) => (p.invalid = true))
    }
  }
}

export default SegmentationScene
