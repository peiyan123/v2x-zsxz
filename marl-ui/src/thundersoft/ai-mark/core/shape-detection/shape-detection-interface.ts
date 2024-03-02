import { ShapeDetectionData } from './shape-detection-model';
import { Subject } from 'rxjs';

export interface ShapeDetectionInterface {
  /**
   * 矩形集合
   */
  shapeDetections?: ShapeDetectionData[]
  
  /**
   * 正在绘制的矩形
   */
  shapeDetectionDrawing?: ShapeDetectionData | null

  /**
   * 绘制成功事件
   */
  shapeDetectionCreateSuccess?: Subject<ShapeDetectionData>

  /**
   * 矩形绘制 参数 (非空则开启绘制功能)
   */
  shapeDetectionSource?: ShapeDetectionData | null

  /**
   * 进入绘制模式：画点
   * @param rules 
   */
  shapeDetectionDrawOption?(option: ShapeDetectionData): void
}