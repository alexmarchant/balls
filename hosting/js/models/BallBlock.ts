import Block from './Block'

const color = '#ff3f00'
const radius = 10

export default class BallBlock extends Block {
  render(ctx: CanvasRenderingContext2D, columnWidth: number, rowHeight: number) {
    const x = (columnWidth * this.column) + (columnWidth / 2)
    const y = (rowHeight * (this.row + 1)) + (rowHeight / 2)

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
  }
}
