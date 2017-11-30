import Block from './Block'
import HitBlock from './HitBlock'
import BallBlock from './BallBlock'
import Ball from './Ball'
import Point from '../interfaces/Point'
import { RootState } from '../components/Root'
import Size from '../interfaces/Size'
import Collision from '../interfaces/Collision'
import Boundaries from '../interfaces/Boundaries'

// Constants/Settings

const fps = 144;
const rows = 10
const columns = 7
// delayBetweenBalls is in ms
const delayBetweenBalls = 30
const ballVelocity = 900

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Game object

interface GameState {
  startScreen: boolean
  mousePoint: Point
  aiming: boolean
  blocks: Array<Block>
  balls: Array<Ball>
  level: number
  lost: boolean
  aimFromX: number
  ballCount: number
  clickPoint: Point
}

export default class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private canvasSize: Size
  private rootSetState: (state: Partial<RootState>) => void
  private state: GameState

  constructor(
    canvasIn: HTMLCanvasElement,
    ctxIn: CanvasRenderingContext2D,
    canvasSize: Size,
    rootSetStateIn: (state: Partial<RootState>) => void
  ) {
    this.canvas = canvasIn
    this.ctx = ctxIn
    this.canvasSize = canvasSize
    this.rootSetState = rootSetStateIn
    this.state = this.defaultGameState()
  }

  start() {
    this.levelDidChange()
    this.startRenderLoop()
  }

  setState(state: Partial<GameState>) {
    const oldState: GameState = {...this.state};
    this.state = {
      ...this.state,
      ...state,
    }
    this.stateDidChange(oldState)
  }

  private stateDidChange(oldState: GameState) {
    if (oldState.level !== this.state.level) {
      this.levelDidChange()
    }
    if (
      oldState.level !== this.state.level ||
      oldState.ballCount !== this.state.ballCount
    ) {
      this.updateUI()
    }
  }

  private defaultGameState(): GameState {
    return {
      startScreen: true,
      mousePoint: null,
      aiming: true,
      blocks: [],
      balls: [],
      level: 1,
      lost: false,
      aimFromX: this.canvasSize.width / 2,
      ballCount: 1,
      clickPoint: null,
    }
  }

  private startRenderLoop() {
    setInterval(this.render.bind(this), (1000 / fps))
  }

  private updateUI() {
    this.rootSetState({
      level: this.state.level,
      ballCount: this.state.ballCount,
    })
  }

  private render() {
    // Clear entire canvas
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)

    // Render content from scratch
    if (this.state.startScreen) {
      this.renderStartScreen()
    } else if (this.state.lost) {
      this.renderGameOverScreen()
    } else {
      this.renderGame()
    }

    // Clear mouse clicks
    // If nothing does anything with the mouse click in the previous
    // frame it gets tossed
    this.setState({clickPoint: null})
  }

  private renderStartScreen() {
    this.renderCenteredButton('Start Game', () => {
      this.setState({startScreen: false})
    })
  }

  private renderGameOverScreen() {
    this.renderCenteredButton('Play Again', () => {
      const newState = {...this.defaultGameState()}
      newState.startScreen = false
      this.setState(newState)
    })
  }

  private renderCenteredButton(text: string, clickHandler: any) {
    const fontSize = 16
    const font = `${fontSize}px sans-serif`

    const textWidth = this.ctx.measureText(text).width
    const x = (this.canvasSize.width - textWidth) / 2
    const y = (this.canvasSize.height - fontSize) / 2
    this.ctx.font = font

    const padding = 10
    const bx = x - padding
    const by = y - padding - fontSize + 2
    const bw = textWidth + padding * 2
    const bh = fontSize + padding * 2

    // If hover over button
    if (
      this.state.mousePoint &&
      this.state.mousePoint.x > bx && 
      this.state.mousePoint.x < bx + bw &&
      this.state.mousePoint.y > by &&
      this.state.mousePoint.y < by + bh
    ) {
      this.ctx.fillStyle = 'grey'
    } else {
      this.ctx.fillStyle = 'white'
    }

    this.ctx.fillRect(bx, by, bw, bh)
    this.ctx.strokeStyle = 'black'
    this.ctx.strokeRect(bx, by, bw, bh)
    this.ctx.fillStyle = 'black'
    this.ctx.fillText(text, x, y)

    // If click on button
    if (
      this.state.clickPoint &&
      this.state.clickPoint.x > bx && 
      this.state.clickPoint.x < bx + bw &&
      this.state.clickPoint.y > by &&
      this.state.clickPoint.y < by + bh
    ) {
      clickHandler()
    }
  }

  private renderGame() {
    this.checkForLoseCondition()
    this.checkForNextLevel()
    this.renderBlocks()
    this.renderAimFromX()

    if (this.state.aiming) {
      this.renderAimer()
    } else {
      this.repositionBalls()
      this.renderBalls()
    }
  }

  private checkForLoseCondition() {
    this.state.blocks.forEach((block) => {
      if (Math.ceil(block.boundaries().maxY) >= this.canvasSize.height) {
        this.setState({lost: true})
      }
    });
  }

  private checkForNextLevel() {
    if (this.state.aiming) { return }

    var allBallsDead = true

    this.state.balls.forEach(ball => {
      if (!ball.dead) {
        allBallsDead = false
      }
    })

    if (allBallsDead) {
      this.setState({
        balls: [],
        aiming: true,
        level: this.state.level + 1,
      })
    }
  }

  private renderBlocks() {
    this.state.blocks.forEach(block => block.render(this.ctx))
  }

  private repositionBalls() {
    const newBalls = this.state.balls.map(ball => {
      ball.moveToNextPoint(1 / fps)

      const boundaries = ball.boundaries()

      // Wall collisions
      if (
        boundaries.minX < 0 || 
        boundaries.maxX > this.canvasSize.width
      ) {
        ball.velocity.x = -ball.velocity.x
      }
      if (boundaries.minY < 0) {
        ball.velocity.y = -ball.velocity.y
      }
      if (boundaries.minY > this.canvasSize.height) {
        ball.dead = true
        if (!this.state.aimFromX) {
          let x = ball.point.x
          if (ball.boundaries().minX < 0) {
            x = 0 + ball.radius
          }
          this.setState({aimFromX: x})
        }
      }

      // Block collisions
      this.state.blocks.forEach(block => {
        const collision = ball.collisionWith(block, 1 / fps)
        if (collision.top || collision.bottom || collision.left || collision.right) {
          this.blockWasHit(block)
        }
        if (block instanceof HitBlock) {
          if (collision.top || collision.bottom) {
            ball.velocity.y = -ball.velocity.y
          }
          if (collision.left || collision.right) {
            ball.velocity.x = -ball.velocity.x
          }
        }
      })

      return ball
    })

    this.setState({balls: newBalls})
  }

  private renderBalls() {
    this.state.balls.forEach(ball => ball.render(this.ctx))
  }

  private renderAimer() {
    const fromX = this.state.aimFromX
    const fromY = this.canvasSize.height

    // Handle hover
    if (this.state.mousePoint) {
      const toX = this.state.mousePoint.x
      const toY = this.state.mousePoint.y

      this.ctx.beginPath()
      this.ctx.moveTo(fromX, fromY)
      this.ctx.lineTo(toX, toY)
      this.ctx.closePath()
      this.ctx.strokeStyle = 'black'
      this.ctx.stroke()
    }

    // Handle click
    if (this.state.clickPoint) {
      this.shoot()
    }
  }

  private levelDidChange() {
    const blockCount = getRandomInt(1, columns - 1)
    const newBlocks = this.state.blocks.map(block => {
      block.point.y += this.rowHeight()
      return block
    })
    const filledColumns = []
    // HitBlocks
    for(var i = 0; i < blockCount; i++) {
      var column = getRandomInt(0, columns)
      while(filledColumns.indexOf(column) !== -1) {
        column = getRandomInt(0, columns)
      }
      filledColumns.push(column)
      const point = {
        x: column * this.columnWidth(),
        y: this.rowHeight(),
      }
      const size = {
        width: this.columnWidth(),
        height: this.rowHeight(),
      }
      let hits = this.state.level
      if (getRandomInt(1, 11) === 1) {
        hits = this.state.level * 2
      }
      newBlocks.push(new HitBlock(
        point,
        size,
        hits
      ))
    }
    // BallBlock
    var column = getRandomInt(0, columns)
    while(filledColumns.indexOf(column) !== -1) {
      column = getRandomInt(0, columns)
    }
    const point = {
      x: column * this.columnWidth(),
      y: this.rowHeight(),
    }
    const size = {
      width: this.columnWidth(),
      height: this.rowHeight(),
    }
    newBlocks.push(new BallBlock(
      point,
      size
    ))
    // Add all blocks
    this.setState({blocks: newBlocks})
  }

  private shoot() {
    const aimDeltaX = this.state.clickPoint.x - this.state.aimFromX
    const aimDeltaY = this.state.clickPoint.y - this.canvasSize.height

    const aimDeltaSum = Math.abs(aimDeltaY) + Math.abs(aimDeltaX)

    const point = {
      x: this.state.aimFromX,
      y: this.canvasSize.height,
    }
    const velocity = {
      x: (aimDeltaX / aimDeltaSum) * ballVelocity,
      y: (aimDeltaY / aimDeltaSum) * ballVelocity,
    }

    for(var i = 0; i < this.state.ballCount; i++) {
      const newBall = new Ball(
        {...point},
        {...velocity}
      )
      setTimeout(() => {
        const newBalls = [...this.state.balls]
        newBalls.push(newBall)
        this.setState({balls: newBalls})
      }, i * delayBetweenBalls)
    }

    this.setState({
      aiming: false,
      aimFromX: null,
    })
  }

  private blockWasHit(block: Block) {
    if (block instanceof HitBlock) {
      this.hitBlockWasHit(block)
    } else {
      this.ballBlockWasHit(block)
    }
  }

  private hitBlockWasHit(hitBlock: HitBlock) {
    const newBlocks: Array<Block> = []
    this.state.blocks.forEach(block => {
      if (hitBlock === block) {
        const thisBlock = block as HitBlock
        const hits = thisBlock.hits - 1
        if (hits !== 0) {
          thisBlock.hits -= 1
          newBlocks.push(thisBlock)
        }
      } else {
        newBlocks.push(block)
      }
    })
    this.setState({blocks: newBlocks})
  }

  private ballBlockWasHit(block: BallBlock) {
    const newBlocks: Array<Block> = []
    this.state.blocks.forEach(b => {
      if (block !== b) {
        newBlocks.push(b)
      }
    })
    this.setState({
      blocks: newBlocks,
      ballCount: this.state.ballCount + 1,
    })
  }

  private rowHeight() {
    return this.canvasSize.height / (rows + 1)
  }

  private columnWidth() {
    return this.canvasSize.width / columns
  }

  private renderAimFromX() {
    if (!this.state.aimFromX) { return }
    
    const point = {
      x: this.state.aimFromX,
      y: this.canvasSize.height,
    }
    const velocity = {x: 0, y: 0}
    const ball = new Ball(
      point,
      velocity
    )
    ball.render(this.ctx)
  }
}

