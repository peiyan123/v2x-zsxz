import { ShapeCrossData } from './shape-cross-model';
import { Subject } from 'rxjs';


export interface ShapeCrossInterface {
  cross?: Boolean

  shapeCross?:ShapeCrossData[]

  currentCross?: ShapeCrossData | null

  shapeCrossDrawing?(shapeConfig: ShapeCrossData):void

  shapeCrossDrawSuccessEvent?: Subject<ShapeCrossData>


}