import Collider from './Collider'
import Point from '../interfaces/Point'
import Size from '../interfaces/Size'
import Boundaries from '../interfaces/Boundaries'

export default abstract class Block extends Collider {
  point: Point
  size: Size

  constructor(point: Point, size: Size) {
    super()
    this.point = point
    this.size = size
  }

  abstract render(ctx: CanvasRenderingContext2D): void

  boundaries(): Boundaries {
    return {
      minX: this.point.x,
      maxX: this.point.x + this.size.width,
      minY: this.point.y,
      maxY: this.point.y + this.size.height,
    }
  }
}
