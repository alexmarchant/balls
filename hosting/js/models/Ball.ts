import Collider from './Collider'
import Position from '../interfaces/Position'
import Velocity from '../interfaces/Velocity'
import Boundaries from '../interfaces/Boundaries'

const radius = 7
const color = 'black'

export default class Ball extends Collider {
  position: Position
  velocity: Velocity
  dead: boolean

  constructor(
    position: Position,
    velocity: Velocity,
    dead: boolean
  ) {
    super()
    this.position = position
    this.velocity = velocity
    this.dead = dead
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.dead) { return }
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
  }

  boundaries(): Boundaries {
    return this.calculateBoundaries(this.position)
  }

  previousBoundaries(seconds: number): Boundaries {
    const position = this.lastPosition(seconds)
    return this.calculateBoundaries(position)
  }

  moveToNextPosition(seconds: number) {
    this.position = this.nextPosition(seconds)
  }

  nextPosition(seconds: number): Position {
    return {
      x: this.position.x + this.velocity.x * seconds,
      y: this.position.y + this.velocity.y * seconds,
    }
  }

  lastPosition(seconds: number): Position {
    return {
      x: this.position.x - this.velocity.x * seconds,
      y: this.position.y - this.velocity.y * seconds,
    }
  }

  collisionWith(target: Collider, seconds: number): Collision {
    const targetB = target.boundaries()
    const thisB = this.boundaries()

    const collision = {
      top: false,
      bottom: false,
      right: false,
      left: false,
    }

    if (
      (
        (thisB.minX <= targetB.maxX && thisB.minX >= targetB.minX) || // Right 
        (thisB.maxX >= targetB.minX && thisB.maxX <= targetB.maxX) // Left 
      ) && (
        (thisB.minY <= targetB.maxY && thisB.minY >= targetB.minY) || // Top 
        (thisB.maxY >= targetB.minY && thisB.maxY <= targetB.maxY) // Bottom 
      )
    ) {
      const previousB = this.previousBoundaries(seconds)

      if (previousB.minX >= targetB.maxX) {
        collision.right = true
      }
      if (previousB.maxX <= targetB.minX) {
        collision.left = true
      }
      if (previousB.minY >= targetB.maxY) {
        collision.bottom = true
      }
      if (previousB.maxY <= targetB.minY) {
        collision.top = true
      }
    }

    return collision
  }

  private calculateBoundaries(position: Position): Boundaries {
    return {
      minX: position.x - radius,
      maxX: position.x + radius,
      minY: position.y - radius,
      maxY: position.y + radius,
    }
  }
}
