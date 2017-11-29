import * as React from 'react'

interface CanvasProps {
  width: number
  height: number
  setCanvas: (canvas: HTMLCanvasElement) => void
  setCTX: (ctx: CanvasRenderingContext2D) => void
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
      >
      </canvas>
    )
  }
}
