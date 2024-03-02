import { AiMarkInterface } from '..';
import { ShapeDetectionData } from './shape-detection-model';

/**
 * ShapePointLoadDecorators
 */
export function ShapeDetectionLoadDecorators <T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {

    /**
     * 加载图形数据
     * @param shap 
     */
    loadShapeDetection?(shap: ShapeDetectionData[]): void {
      this.shapeSelectPlan = this.shapeDetections = []
      shap.forEach(shapConfig => {
        // 计算 labelCole
        shapConfig.labelColor = this.getLabelCole!(shapConfig.color!)
        // 图形id
        shapConfig.shapeId = shapConfig.shapeId || 'shapPoint:'+(new Date()).getTime()+Math.round(Math.random()*10000)
        // 加载图形的点
        shapConfig.point = shapConfig.pointSource!.map(source => ({
          id: Symbol('PointId'), source: {
            ...source,
            color: shapConfig.color,
            labelColor: shapConfig.labelColor,
            shapeId: shapConfig.shapeId
          }
        }))
        this.shapeDetections!.push({
          ...shapConfig,
          shapeId: shapConfig.shapeId
        })
      })
    }
  }
}

