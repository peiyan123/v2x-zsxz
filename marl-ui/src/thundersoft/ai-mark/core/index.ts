export * from './canvas';
export * from './image';
export * from './guide';
export * from './line';
export * from './point';
export * from './shape';
export * from './shape-point';
export * from './shape-detection';
export * from './shape-segmentation';
export * from './util';
export * from './config';


import { MarkImageInterface } from './image';
import { MarkGuideToolInterface } from './guide';
import { MarkPointInterface } from './point';
import { MarkShapePointInterface } from './shape-point';
import { MarkShapeInterface } from './shape';
import { MarkCanvasInterface } from './canvas/index';
import { MarkLineInterface } from './line/index';
import { MarkShapeDetectionInterface } from './shape-detection/index';
import { MarkShapeSegmentationInterface } from './shape-segmentation/index';
import { MarkFontInterface } from './font/index';
import { MarkFillInterface } from './fill';
import { MarkShapeCrossInterface } from './shape-cross';

/**
 * Core Interface
 */
export interface AiMarkInterface extends
    MarkCanvasInterface,
    MarkImageInterface,
    MarkPointInterface,
    MarkLineInterface,
    MarkFontInterface,
    MarkFillInterface,
    MarkGuideToolInterface,
    MarkShapeInterface,
    MarkShapePointInterface,
    MarkShapeDetectionInterface,
    MarkShapeSegmentationInterface,
    MarkShapeCrossInterface
{
    // [propName: string]: any
}