import * as React from 'react'
import Point from '../interfaces/Point'

interface CanvasProps {
  width: number
  height: number
  setCanvas: (canvas: HTMLCanvasElement) => void
  setCTX: (ctx: CanvasRenderingContext2D) => void
  setMousePoint: (point: Point) => void
  setClickPoint: (point: Point) => void
}

export default class Canvas extends React.Component<CanvasProps, {}> {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(2,2)
    this.props.setCanvas(this.canvas)
    this.props.setCTX(this.ctx)
  }

  handleMouseLeave(event: MouseEvent) {
    this.props.setMousePoint(null)
  }

  handleMouseMove(event: MouseEvent) {
    this.props.setMousePoint({
      x: event.clientX - this.canvas.offsetLeft,
      y: event.clientY - this.canvas.offsetTop,
    })
  }

  handleClick(event: MouseEvent) {
    this.props.setClickPoint({
      x: event.clientX - this.canvas.offsetLeft,
      y: event.clientY - this.canvas.offsetTop,
    })
  }

  render() {
    return (
      <canvas
        id="canvas"
        ref={el => this.canvas = el}
        width={this.props.width * 2}
        height={this.props.height * 2}
        style={{
          width: this.props.width,
          height: this.props.height,
        }}
        onMouseLeave={this.handleMouseLeave.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
        onClick={this.handleClick.bind(this)}
      >
      </canvas>
    )
  }
}
