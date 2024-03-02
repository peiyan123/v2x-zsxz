export * from './line-draw-decorators';
export * from './line-draw-interface';
export * from './line-model';

import { LineDrawInterface } from './line-draw-interface';

export interface MarkLineInterface extends
  LineDrawInterface
{
    /**
     * 清除线
     */
    lineClear?(): void
}

import { AiMarkInterface } from '..';
import { LineDrawDecorators } from './line-draw-decorators';
import { CONFIG } from '../config';
/**
 * MarkImageDecorators
 * @param constructor 
 * @returns 
 */
export function MarkLineDecorators<T extends new (...args: any[]) => AiMarkInterface>(constructor: T) {
  @LineDrawDecorators(CONFIG.line)
  class MarkLineClass extends constructor {
    /**
     * 清除线
     */
    lineClear() {
      this.lines = []
      this.linesMap?.clear()
    }
  }
  return MarkLineClass
};