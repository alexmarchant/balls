import Collider from './Collider'
import Point from '../interfaces/Point'
import Velocity from '../interfaces/Velocity'
import Boundaries from '../interfaces/Boundaries'
import Collision from '../interfaces/Collision'

export default class Ball extends Collider {
  point: Point
  velocity: Velocity
  dead: boolean = false
  color: string = 'black'
  radius: number = 7

  constructor(point: Point, velocity: Velocity) {
    super()
    this.point = point
    this.velocity = velocity
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.dead) { return }
    ctx.beginPath()
    ctx.arc(this.point.x, this.point.y, this.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  boundaries(): Boundaries {
    return this.calculateBoundaries(this.point)
  }

  previousBoundaries(seconds: number): Boundaries {
    const point = this.lastPoint(seconds)
    return this.calculateBoundaries(point)
  }

  moveToNextPoint(seconds: number) {
    this.point = this.nextPoint(seconds)
  }

  nextPoint(seconds: number): Point {
    return {
      x: this.point.x + this.velocity.x * seconds,
      y: this.point.y + this.velocity.y * seconds,
    }
  }

  lastPoint(seconds: number): Point {
    return {
      x: this.point.x - this.velocity.x * seconds,
      y: this.point.y - this.velocity.y * seconds,
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

  private calculateBoundaries(point: Point): Boundaries {
    return {
      minX: point.x - this.radius,
      maxX: point.x + this.radius,
      minY: point.y - this.radius,
      maxY: point.y + this.radius,
    }
  }
}
