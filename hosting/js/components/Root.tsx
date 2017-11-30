import '../../css/bundle.css'
import * as React from 'react'
import Canvas from './Canvas'
import Game from '../models/Game'
import Size from '../interfaces/Size'
import Point from '../interfaces/Point'

export interface RootState {
  level: number
  ballCount: number
  canvasSize: Size
}

export default class Root extends React.Component<{}, RootState> {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private game: Game

  constructor(props: {}) {
    super(props)
    this.state = {
      level: 1,
      ballCount: 1,
      canvasSize: {
        width: 600,
        height: 600,
      },
    }
  }

  componentDidMount() {
    this.startGame()
  }

  startGame() {
    this.game = new Game(
      this.canvas,
      this.ctx,
      this.state.canvasSize,
      (state: any) => this.setState(state)
    )
    this.game.start()
  }

  setMousePoint(point: Point) {
    this.game.setState({mousePoint: point})
  }

  setClickPoint(point: Point) {
    this.game.setState({clickPoint: point})
  }

  render() {
    return (
      <div id="game">
        <div id="state">
          <div>
            Level:
            {this.state.level}
          </div>
          <div>
            Balls:
            {this.state.ballCount}
          </div>
        </div>
        <Canvas
          width={this.state.canvasSize.width}
          height={this.state.canvasSize.height}
          setCanvas={canvas => { this.canvas = canvas }}
          setCTX={ctx => { this.ctx = ctx }}
          setMousePoint={this.setMousePoint.bind(this)}
          setClickPoint={this.setClickPoint.bind(this)}
        />
      </div>
    )
  }
}

