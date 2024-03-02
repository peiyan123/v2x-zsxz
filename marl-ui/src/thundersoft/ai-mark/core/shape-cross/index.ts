import { AiMarkInterface } from '..';
import { ShapeLabelColeDecorators } from '../shape/shape-label-cole-decorators';
import { MarkShapeDecorators } from '../shape/index';
import { GuidelineDecorators } from '../guide/guide-line-decorators';
import { MarkPointBaseDecorators } from '../point/index';
import { MarkLineDecorators } from '../line/index';
import { MarkImageDecorators } from '../image/index';
import { ShapeCrossDecorators } from './shape-cross-decorators';
import { ShapeCrossInterface } from './shape-cross-interface';
import { ShapeCrossLoadInterface } from './shape-cross-load-interface';
import { ShapeCrossLoadDecorators } from './shape-cross-load-decorators';

export interface MarkShapeCrossInterface extends ShapeCrossInterface,ShapeCrossLoadInterface {}

export function MarkShapeCrossDecorators<T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {

  @GuidelineDecorators // 图层顺序 辅助线 最上层
  @MarkPointBaseDecorators
  @ShapeCrossDecorators
  @ShapeCrossLoadDecorators
  @MarkLineDecorators // 图层顺序 线
  @ShapeLabelColeDecorators
  @MarkShapeDecorators
  @MarkImageDecorators // 图层顺序 图片
  class MarkShapeCross extends constructor {}
  return MarkShapeCross
}