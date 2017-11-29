import Collider from './Collider'
import Position from '../interfaces/Position'
import Size from '../interfaces/Size'
import Boundaries from '../interfaces/Boundaries'

export default abstract class Block extends Collider {
  position: Position
  size: Size

  constructor(position: Position, size: Size) {
    super()
    this.position = position
    this.size = size
  }

  abstract render(ctx: CanvasRenderingContext2D): void

  boundaries(): Boundaries {
    return {
      minX: this.position.x,
      maxX: this.position.x + this.size.width,
      minY: this.position.y,
      maxY: this.position.y + this.size.height,
    }
  }
}
