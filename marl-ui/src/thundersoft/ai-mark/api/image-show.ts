import { AiMarkInterface, MarkCanvasBaseClass, Shape } from '../core'
import { Subscription, Subject, fromEvent } from 'rxjs'
import { MarkImageDecorators } from '../core/image/index'

@MarkImageDecorators
class AiMark extends MarkCanvasBaseClass {}

/**
 * 图片分类场景 ClassificationScene
 */
export class ImageShowScene {
  // 画布对象
  markCanvas: AiMarkInterface = new AiMark()

  destroyEvent: (Subscription | undefined)[] = []

  constructor(el: HTMLElement, url: string) {
    this.markCanvas.init(el, url)
  }

  destroy() {
    // 消除 上一次 init 订阅的事件
    this.markCanvas.destroyMap.forEach((ds) => ds.forEach((d) => d?.unsubscribe()))
    this.destroyEvent.forEach((d) => d?.unsubscribe())
    this.markCanvas.destroy.forEach((d) => d?.unsubscribe())
  }

  changeImage(url) {
    this.markCanvas.loadImage!(url)
  }
}

export default ImageShowScene
