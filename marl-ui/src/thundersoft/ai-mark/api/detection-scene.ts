import { fromEvent, Subject, Subscription } from 'rxjs';
import {
    AiMarkInterface,
    MarkCanvasBaseClass,
    ShapeDetectionData,
    MarkShapeDetectionDecorators,
    Shape
} from '../core';

// 如果是同一图片，则联动显示
let imageId: any = '', aimarkArray: AiMarkInterface[] = [], eventSubject: (Subscription | undefined)[] = [],
    imageChange = (url: any, aimark: AiMarkInterface) => {
        // console.log('ai mark => imageChange', url, aimark)
        imageId = url
        aimarkArray = [aimark]
        eventSubject.forEach(d => d?.unsubscribe())
        eventSubject = []
    },
    imageCopy = (aimark: AiMarkInterface) => {
        // console.log('ai mark => imageCopy', aimark)
        eventSubject.push(aimark.imageChangeEvent!.subscribe(s => {
            aimarkArray[0].imageStartPoint = aimark.imageStartPoint
            aimarkArray[0].canvasZoom = aimark.canvasZoom
        }))
        eventSubject.push(aimarkArray[0].imageChangeEvent!.subscribe(s => {
            aimark.imageStartPoint = aimarkArray[0].imageStartPoint
            aimark.canvasZoom = aimarkArray[0].canvasZoom
        }))
        aimarkArray.push(aimark)
    };
@MarkShapeDetectionDecorators
class AiMark extends MarkCanvasBaseClass {}

export class DetectionScene {

    // 画布对象
    markCanvas: AiMarkInterface = new AiMark()

    destroyEvent: (Subscription|undefined)[] = []

    /**
     * 对象删除事件
     */
    deleteShapeEvent: Subject<Shape> = new Subject<Shape>()

    constructor(el: HTMLElement, url?: string, markData: ShapeDetectionData[] = []) {
        if ( (imageId === url) && (aimarkArray.length === 1) ) {
            imageCopy(this.markCanvas)
        } else {
            imageChange(url, this.markCanvas)
        }
        this.markCanvas.destroyMap.set('scene', this.destroyEvent)
        this.markCanvas.init(el, url)
        this.setData(markData)
        // 监听键盘 删除键
        this.destroyEvent.push(fromEvent(document, 'keydown').subscribe((e: any) => {
            // backspace: 8   delete:46
            if ( (e.keyCode === 8) || (e.keyCode === 46)) {
                // 删除选中的对象或者点
                this.deleteSelected()
            }
        }))
    }

    destroy() {
        // 消除 上一次 init 订阅的事件
        this.markCanvas.destroyMap.forEach(ds => ds.forEach(d => d?.unsubscribe()))
        this.destroyEvent.forEach(d => d?.unsubscribe())
    }

    /**
     * 删除选中的对象
     */
    deleteSelected() {
        // 删除对象
        if (this.markCanvas.shapeSelected) {
            // 删除形状
            this.markCanvas.shapeDetections?.splice(this.markCanvas.shapeDetections?.indexOf(this.markCanvas.shapeSelected), 1)
            // 删除形状的点和线
            this.markCanvas.pointsMap?.delete(this.markCanvas.shapeSelected.shapeId!)
            this.markCanvas.linesMap?.delete(this.markCanvas.shapeSelected.shapeId!)
            this.markCanvas.pointClearDoing!()

             // 事件 通知
             this.deleteShapeEvent.next(this.markCanvas.shapeSelected)

            // 删除选中的对象
            this.markCanvas.shapeHover = null
            this.markCanvas.shapeSelected = null
        }
    }

    /**
     * 载入 图片 + mark 标注数据
     * @param url 
     */
    reload(url: string, markData: ShapeDetectionData[]) {
        // 载入 图片
        this.markCanvas.loadImage!(url)
        // 载入 标注数据
        this.setData(markData)
    }
    /**
     * @returns 
     */
    setData(markData: ShapeDetectionData[]) {
        this.markCanvas.pointClear!()
        this.markCanvas.lineClear!()
        this.markCanvas.shapeClear!()
        // 清空 点图标注 数据
        this.markCanvas.shapeDetections!.length = 0
        // 载入 标注数据
        this.markCanvas.loadShapeDetection!(markData)
    }
    /**
     * 当前选中的数据
     * @returns 
     */
    getShapeSelected() {
        return this.markCanvas.shapeSelected
    }
    /**
     * 进入标注模式
     */
    openMarkMode(shapeCofig?: ShapeDetectionData) {
        // 所有图形都设为 可选的
        this.markCanvas.shapeSelectPlan = this.markCanvas.shapeDetections
        // 开启新对象的标注模式
        if (shapeCofig) this.markCanvas.shapeDetectionDrawOption!(shapeCofig)
    }
    /**
     * 关闭标注模式
     */
    closeMarkMode() {
        // 所有图形都设为 不可选的
        this.markCanvas.shapeSelectPlan = []
        this.markCanvas.shapeHoverPlan = this.markCanvas.shapeDetections
        // 取消当前选中的图形
        this.markCanvas.shapeSelected = null
        this.markCanvas.shapeHover = null
        // 取消当前 对点的操作
        this.markCanvas.pointClearDoing!()
        // 关闭 新对象的标注模式
        this.markCanvas.shapeDetectionSource = null
    }
    /**
     * 复位
     */
    reset() {
        this.markCanvas.canvasZoomDefault!()
    }
    /**
     * 获取数据
     */
    getData() {
        return this.markCanvas.shapeDetections?.filter(s => s.point)?.map(s => ({
            ...s,
            pointSource: JSON.parse(JSON.stringify(s.point?.map(p => ({x: p.source.x, y: p.source.y}))))
        }))
    }

    // 修改label TODO lgj
    setLabel(label:string) {
        if (this.markCanvas.shapeSelected) {
            console.log(this.markCanvas.shapeSelected);
            this.markCanvas.shapeSelected.label = label
        }
    }
    // 重新换图
    changeImage(url) {
        this.markCanvas.loadImage!(url)
    }
}

export default DetectionScene;