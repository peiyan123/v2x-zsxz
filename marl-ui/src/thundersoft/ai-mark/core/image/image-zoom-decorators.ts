import { AiMarkInterface } from '..';
import { getVertexPosition, Point2Distance } from '../util'

/**
 * 依赖：@ImageLoadCanvas
        @CanvasEventDecorators
 * ImageZoomDecorators decorator
 */

export function ImageZoomDecorators <T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {

    /**
     * @override 方法重写 super.init
     * @param el 
     * @param url 
     * @param args 
     */
    init(el: HTMLElement, ...args: any[]): any {
      let result = super.init(el, ...args)
      this.canvasZoomScroll()
      return {...result}
    }

    /**
     * 鼠标滚轮缩放图片
     */
    canvasZoomScroll() {
      let lastImageStartPoint = {}
      let lastZoom
      let isTouch = false
      let start = []
      this.destroy.push(
        this.canvasElementEvents!.scroll.subscribe(e => {
          
          e.preventDefault();
          // 当前鼠标点的位置 （canvas 坐标系）
          const currentPoint = { x: e.offsetX, y: e.offsetY }
          // 定义当前比例为1，倍数 1.1，0.9
          let zoom = 1
          // 滚轮方向
          
          if (this.isFirefox) {
            if(e.detail>0){
              zoom = 1.05
            } else {
              zoom = 0.96
            }
          } else {
            if(e.wheelDelta>0){
              zoom = 1.05
            } else {
              zoom = 0.96
            }
          }
  
          // 缩放边界 大 1：20
          if ( (this.canvasZoom * zoom) > (this.accuracy * 20) ) {
            return
          }
          //小：不能小于 100像素
          const imageMaxEdge = (this.imageAspectRatio! > this.accuracy) ? this.image!.width : this.image!.height
          if ( (this.canvasZoom * zoom * imageMaxEdge) < (this.accuracy * 100) ) {
            return
          }
  
          // 图片渲染开始点计算
          let xDistance = (currentPoint.x - this.imageStartPoint!.x)
          let yDistance = (currentPoint.y - this.imageStartPoint!.y)
          this.imageStartPoint!.x = this.imageStartPoint!.x + xDistance * (1 - zoom)
          this.imageStartPoint!.y = this.imageStartPoint!.y + yDistance * (1 - zoom)
          // 修改整体缩放比例
          this.canvasZoom = this.canvasZoom * zoom
          
          // 通知
          this.imageChangeEvent!.next('zoom')
        })
      )
      
      this.destroy.push(
        this.canvasElementEvents!.touchstart.subscribe((e) => {
          lastImageStartPoint.x = this.imageStartPoint!.x
          lastImageStartPoint.y = this.imageStartPoint!.y
          lastZoom = this.canvasZoom
          console.log(lastZoom)
          if (e.touches.length>=2) {
            start = e.touches
          }
          isTouch = true
        })
      )
      this.destroy.push(
        this.canvasElementEvents!.touchmove.subscribe((e) => {
          if (e.touches.length == 2 && isTouch) {
            let now = e.touches
            const zoom = (
              Point2Distance({x:now[0].pageX, y:now[0].pageY}, {x:now[1].pageX, y:now[0].pageY})
             / Point2Distance({x:start[0].pageX, y:start[0].pageY}, {x:start[1].pageX, y:start[0].pageY})
             )
            const currentZoom = lastZoom * zoom
            if (currentZoom  > (this.accuracy * 20) ) {
              return
            }
            const imageMaxEdge = (this.imageAspectRatio! > this.accuracy) ? this.image!.width : this.image!.height
            if ( (currentZoom * imageMaxEdge) < (this.accuracy * 100) ) {
              return
            }
            let xDistance = (this.canvasElement.width/2 - lastImageStartPoint!.x)
            let yDistance = (this.canvasElement.height/2 - lastImageStartPoint!.y)
            this.imageStartPoint!.x = lastImageStartPoint.x + xDistance * (1-zoom)
            this.imageStartPoint!.y = lastImageStartPoint.y + yDistance * (1-zoom)
            console.log(this.imageStartPoint!.x, this.imageStartPoint!.y)
            // 通知
            this.imageChangeEvent!.next('zoom')
            this.canvasZoom = currentZoom
          }
          
        })
      )

      this.destroy.push(
        this.canvasElementEvents!.touchend.subscribe((e) => {
          isTouch = false
        })
      )
    }
  };
};