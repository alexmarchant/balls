import Block from './Block'

const color = '#ff3f00'
const radius = 10

export default class BallBlock extends Block {
  render(ctx: CanvasRenderingContext2D) {
    const ballX = this.position.x + (this.size.width / 2)
    const ballY = this.position.y + (this.size.height / 2)

    ctx.beginPath()
    ctx.arc(ballX, ballY, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
  }
}
