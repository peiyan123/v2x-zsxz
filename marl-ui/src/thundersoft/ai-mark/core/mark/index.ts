import { filter } from 'rxjs/operators';
import { Shape, ShapePointData } from '..';
import { RatioConversion,RatioCalculation } from '../util';

export function MarkPointDecorators <T extends new (...args: any[]) => any>(constructor: T) {
  class MarkClass extends constructor {
    markMap: any = new Map()
    markStop: boolean = true
    markIndex: number = 1
    drawMarkInit() {
      this.drawMark()
      this.canvasElementEvents.leftSingleClick.subscribe((e:MouseEvent) => {
        if (this.markStop) return
        const [x,y] = [e.offsetX, e.offsetY]
        if (this.imageRangeOnXY(x,y)) {
          const shapeId = 'shapeMark:' + (new Date()).getTime() + Math.round(Math.random() * 10000)
          const source = {label: `点${this.markIndex}`,labelColor: "rgb(64,173.25,59)",x: RatioCalculation((x - this.imageStartPoint!.x), this.canvasZoom, this.accuracy),y: RatioCalculation((y - this.imageStartPoint!.y), this.canvasZoom, this.accuracy),color: "rgb(64,173.25,59)",shapeId}
          this.markMap.set(shapeId,{x,y,source })


          const shape: Shape = {
            color: "rgb(255,0,0)",
            point: [
              {id:Symbol(),invalid:true,x,y,source: source},
            ],
            shapeId: shapeId,
          }
          this.shapeHoverPlan.push(shape)
          this.shapeSelectPlan.push(shape)
          this.markIndex++
        }
      })

      this.imageChangeEvent?.pipe(filter(s=>s === 'drag' || s === 'zoom')).subscribe((e:string) => {
        const updatePointPosition = (point: any) => {
        point.x = RatioConversion(point.source.x, this.canvasZoom, this.accuracy) + this.imageStartPoint!.x
        point.y = RatioConversion(point.source.y, this.canvasZoom, this.accuracy) + this.imageStartPoint!.y
       
      }
      this.markMap.forEach((point:any) => {
        updatePointPosition(point)
      })

    })
    }

    drawMark() {
      this.canvasOperation((ctx: CanvasRenderingContext2D) => {
        const fonts:any[] = [];
        const markDraw = (point:any) => {
          const x = point.x
          const y = point.y
          const w = 25
          ctx.restore()
          ctx.beginPath();  //注释二
          ctx.setLineDash([0]);
          ctx.lineWidth=1;
          ctx.strokeStyle = '#ff0000';
          ctx.moveTo(x-w/2,y);
          ctx.lineTo(x+w/2,y);
          ctx.moveTo(x,y-w/2);
          ctx.lineTo(x,y+w/2);
          ctx.stroke();
          if (point.source.label) {
            fonts.push({ point, backgroundColor: "rgb(64,173.25,59,.3)" })
          }
        }
        this.markMap.forEach((point:any) => {
          markDraw(point)
        });
        this.fontsMarkMap?.set('point-fonts', fonts)
      })
    }

    startDrawMark() {
      this.markStop = false
    }

    stopDrawMark() {
      this.markStop = true
    }

    loadMarkData(shape: ShapePointData[]) {
      shape.forEach((shapConfig: ShapePointData) => {
        const config:any = {}
        // 图形id
        config.shapeId = shapConfig.shapeId || 'shapMark:'+(new Date()).getTime()+Math.round(Math.random()*10000)
        // 加载图形的点
        config.point = shapConfig.pointSource!.map(source => ({
          id: Symbol(), source: {
            ...source,
            color: "rgb(64,173.25,59)",
            labelColor: "rgb(64,173.25,59)",
            shapeId: config.shapeId
          },
          invalid:true
        }))
        config.color="rgb(255,0,0)"
        this.markMap.set(config.shapeId, config.point[0])
        this.shapeHoverPlan.push(config)
        this.shapeSelectPlan.push(config)
      })
    }
  }
  return MarkClass
}