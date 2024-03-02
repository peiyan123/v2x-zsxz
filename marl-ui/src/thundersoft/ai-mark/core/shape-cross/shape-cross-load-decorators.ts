import { ShapeCrossData } from './../shape-cross/shape-cross-model'
import { AiMarkInterface } from '..'

export function ShapeCrossLoadDecorators<T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  return class extends constructor {
    loadShapeCross(shap: ShapeCrossData) {
      this.shapeCross!.length = 0
      shap.forEach((shapConfig) => {
        // 计算 labelCole
        shapConfig.labelColor = this.getLabelCole!(shapConfig.color!)
        // 图形id
        shapConfig.shapeId =
          shapConfig.shapeId || 'shapPoint:' + new Date().getTime() + Math.round(Math.random() * 10000)
        // 加载图形的点
        shapConfig.point = shapConfig.pointSource!.map((source) => ({
          invalid: true,
          id: Symbol('PointId'),
          source: {
            ...source,
            color: shapConfig.color,
            labelColor: shapConfig.labelColor,
            shapeId: shapConfig.shapeId,
          },
        }))
        this.pointsMap?.set(shapConfig.shapeId, shapConfig.point!)
        // 加入集合
        this.shapeCross!.push({
          ...shapConfig,
          shapeId: shapConfig.shapeId,
        })
      })
    }
  }
}
