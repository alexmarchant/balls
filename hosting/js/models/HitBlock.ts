import Block from './Block'

const textColor = 'white'
const strokeColor = 'white'

export default class HitBlock extends Block {
  hits: number

  constructor(row: number, column: number, hits: number) {
    super(row, column)
    this.hits = hits
  }

  render(ctx: CanvasRenderingContext2D, columnWidth: number, rowHeight: number) {
    const x = columnWidth * this.column
    const y = rowHeight * (this.row + 1) 
    const w = columnWidth
    const h = rowHeight

    ctx.fillStyle = this.blockColor()
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = strokeColor
    ctx.strokeRect(x, y, w, h)

    const fontSize = 12
    const font = `${fontSize}px sans-serif`
    const text = `${this.hits}`
    const textWidth = ctx.measureText(text).width
    const fx = x + ((w - textWidth) / 2)
    const fy = y + ((h - fontSize) / 2) + fontSize
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
