import Block from './Block'
import Position from '../interfaces/Position'
import Size from '../interfaces/Size'

const textColor = 'white'
const strokeColor = 'white'

export default class HitBlock extends Block {
  hits: number

  constructor(position: Position, size: Size, hits: number) {
    super(position, size)
    this.hits = hits
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.blockColor()
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    )
    ctx.strokeStyle = strokeColor
    ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    )

    const fontSize = 12
    const font = `${fontSize}px sans-serif`
    const text = `${this.hits}`
    const textWidth = ctx.measureText(text).width
    const fx = this.position.x + ((this.size.width - textWidth) / 2)
    const fy = this.position.y + ((this.size.height - fontSize) / 2) + fontSize
    ctx.fillStyle = textColor
    ctx.fillText(text, fx, fy)
  }

  private blockColor(): string {
    const r = Math.min(Math.floor((this.hits - 1) * 10), 255)
    const g = Math.min(0, 255)
    const b = Math.max(Math.floor((255 - this.hits) * 10), 0)

    return `rgb(${r}, ${g}, ${b})`
  }
}
