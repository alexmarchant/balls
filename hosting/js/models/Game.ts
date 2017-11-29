import Block from './Block'
import HitBlock from './HitBlock'
import BallBlock from './BallBlock'
import Ball from './Ball'
import Position from '../interfaces/Position'
import { RootState } from '../components/Root'
import Size from '../interfaces/Size'
import Collision from '../interfaces/Collision'
import Boundaries from '../interfaces/Boundaries'

// Constants/Settings

const fps = 144;
const rows = 10
const columns = 10
const ballRadius = 7
// ballVelocity is in pixels per second
const ballVelocity = 900
// delayBetweenBalls is in ms
const delayBetweenBalls = 30

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Game object

interface GameState {
  startScreen: boolean
  mousePosition: Position
  aiming: boolean
  blocks: Array<Block>
  balls: Array<Ball>
  level: number
  lost: boolean
  aimFromX: number
  ballCount: number
  clickPosition: Position
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
    this.setState({aimFromX: this.canvas.width / 2 / 2})
    this.handleMouseEvents()
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
      mousePosition: null,
      aiming: true,
      blocks: [],
      balls: [],
      level: 0,
      lost: false,
      aimFromX: null,
      ballCount: 1,
      clickPosition: null,
    }
  }

  private handleMouseEvents() {
    this.canvas.addEventListener('mouseenter', this.listenToMouseMoveEvents.bind(this))
    this.canvas.addEventListener('mouseenter', this.listenToMouseClickEvents.bind(this))
    this.canvas.addEventListener('mouseleave', this.stopListeningToMouseMoveEvents.bind(this))
    this.canvas.addEventListener('mouseleave', this.stopListeningToMouseClickEvents.bind(this))
    this.canvas.addEventListener('mouseleave', () => {this.setState({mousePosition: null})})
  }

  private listenToMouseMoveEvents() {
    this.canvas.addEventListener('mousemove', this.setMousePositionState.bind(this))
  }

  private stopListeningToMouseMoveEvents() {
    this.canvas.removeEventListener('mousemove', this.setMousePositionState.bind(this))
  }

  private setMousePositionState(event: MouseEvent) {
    this.setState({
      mousePosition: {
        x: event.clientX - this.canvas.offsetLeft,
        y: event.clientY - this.canvas.offsetTop,
      }
    })
  }

  private listenToMouseClickEvents() {
    this.canvas.addEventListener('click', this.setClickPositionState.bind(this))
  }

  private stopListeningToMouseClickEvents() {
    this.canvas.removeEventListener('click', this.setClickPositionState.bind(this))
  }

  private setClickPositionState(event: MouseEvent) {
    this.setState({
      clickPosition: {
        x: event.clientX - this.canvas.offsetLeft,
        y: event.clientY - this.canvas.offsetTop,
      }
    })
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
    this.setState({clickPosition: null})
  }

  private renderStartScreen() {
    this.renderCenteredButton('Start Game', () => {
      this.setState({startScreen: false})
    })
  }

  private renderGameOverScreen() {
    this.renderCenteredButton('Play Again', () => {
      this.setState({
        lost: false,
        blocks: [],
        level: 1,
        ballCount: 1,
      })
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
      this.state.mousePosition &&
      this.state.mousePosition.x > bx && 
      this.state.mousePosition.x < bx + bw &&
      this.state.mousePosition.y > by &&
      this.state.mousePosition.y < by + bh
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
      this.state.clickPosition &&
      this.state.clickPosition.x > bx && 
      this.state.clickPosition.x < bx + bw &&
      this.state.clickPosition.y > by &&
      this.state.clickPosition.y < by + bh
    ) {
      clickHandler()
    }
  }

  private renderGame() {
    if (this.state.level === 0) {
      this.setState({level: 1})
    }

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
      if (block.boundaries().maxY === this.canvasSize.height) {
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
      ball.x = ball.x + (ball.xv / fps)
      ball.y = ball.y + (ball.yv / fps)

      // Wall collisions
      if (ball.x - ballRadius < 0) {
        ball.xv = -ball.xv
      }
      if (ball.x + ballRadius > this.canvasSize.width) {
        ball.xv = -ball.xv
      }
      if (ball.y - ballRadius < 0) {
        ball.yv = -ball.yv
      }
      if (ball.y - ballRadius > this.canvasSize.height) {
        ball.dead = true
        if (!this.state.aimFromX) {
          this.setState({aimFromX: ball.x})
        }
      }

      // Block collisions
      this.state.blocks.forEach(block => {
        const collision = this.blockBallCollision(block, ball)
        if (block instanceof HitBlock) {
          if (collision.top || collision.bottom) {
            ball.yv = -ball.yv
          }
          if (collision.left || collision.right) {
            ball.xv = -ball.xv
          }
        }
      })

      return ball
    })

    this.setState({balls: newBalls})
  }

  private renderBalls() {
    this.state.balls.forEach(this.renderBall.bind(this))
  }

  private renderAimer() {
    const fromX = this.state.aimFromX
    const fromY = this.canvasSize.height

    // Handle hover
    if (this.state.mousePosition) {
      const toX = this.state.mousePosition.x
      const toY = this.state.mousePosition.y

      this.ctx.beginPath()
      this.ctx.moveTo(fromX, fromY)
      this.ctx.lineTo(toX, toY)
      this.ctx.closePath()
      this.ctx.strokeStyle = 'black'
      this.ctx.stroke()
    }

    // Handle click
    if (this.state.clickPosition) {
      this.shoot()
    }
  }

  private renderBall(ball: Ball) {
    if (ball.dead) { return }
    this.ctx.beginPath()
    this.ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = 'black'
    this.ctx.fill()
  }

  private levelDidChange() {
    const blockCount = getRandomInt(1, columns - 1)
    const newBlocks = this.state.blocks.map(block => {
      block.position.y += this.rowHeight()
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
      const position = {
        x: column * this.columnWidth(),
        y: this.rowHeight(),
      }
      const size = {
        width: this.columnWidth(),
        height: this.rowHeight(),
      }
      newBlocks.push(new HitBlock(
        position,
        size,
        this.state.level
      ))
    }
    // BallBlock
    var column = getRandomInt(0, columns)
    while(filledColumns.indexOf(column) !== -1) {
      column = getRandomInt(0, columns)
    }
    const position = {
      x: column * this.columnWidth(),
      y: this.rowHeight(),
    }
    const size = {
      width: this.columnWidth(),
      height: this.rowHeight(),
    }
    newBlocks.push(new BallBlock(
      position,
      size
    ))
    // Add all blocks
    this.setState({blocks: newBlocks})
  }

  private shoot() {
    const aimDeltaX = this.state.clickPosition.x - this.state.aimFromX
    const aimDeltaY = this.state.clickPosition.y - this.canvasSize.height

    const aimDeltaSum = Math.abs(aimDeltaY) + Math.abs(aimDeltaX)

    const xv = (aimDeltaX / aimDeltaSum) * ballVelocity
    const yv = (aimDeltaY / aimDeltaSum) * ballVelocity

    const newBall = new Ball(
      this.state.aimFromX,
      this.canvasSize.height,
      xv,
      yv,
      false
    )

    for(var i = 0; i < this.state.ballCount; i++) {
      setTimeout(() => {
        const newBalls = [...this.state.balls]
        const newBallClone = {...newBall}
        newBalls.push(newBallClone)
        this.setState({balls: newBalls})
      }, i * delayBetweenBalls)
    }

    this.setState({
      aiming: false,
      aimFromX: null,
    })
  }

  private ballBoundaries(ball: Ball): Boundaries {
    return {
      minX: ball.x - ballRadius,
      minY: ball.y - ballRadius,
      maxX: ball.x + ballRadius,
      maxY: ball.y + ballRadius,
    }
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

  private blockBallCollision(block: Block, ball: Ball): Collision {
    const blockB = block.boundaries()
    const ballB = this.ballBoundaries(ball)

    var collision: Collision = {
      top: false,
      bottom: false,
      right: false,
      left: false,
    }

    if (
      (
        (ballB.minX <= blockB.maxX && ballB.minX >= blockB.minX) || // Right collision
        (ballB.maxX >= blockB.minX && ballB.maxX <= blockB.maxX) // Left collision
      ) && (
        (ballB.minY <= blockB.maxY && ballB.minY >= blockB.minY) || // Top collision
        (ballB.maxY >= blockB.minY && ballB.maxY <= blockB.maxY) // Bottom collision
      )
    ) {
      const previousBallX = ball.x - (ball.xv / fps)
      const previousBallY = ball.y - (ball.yv / fps)
      const previousBall = new Ball(previousBallX, previousBallY, 0, 0, true)
      const previousBallB = this.ballBoundaries(previousBall)
      if (previousBallB.minX >= blockB.maxX) {
        collision.right = true
      }
      if (previousBallB.maxX <= blockB.minX) {
        collision.left = true
      }
      if (previousBallB.minY >= blockB.maxY) {
        collision.bottom = true
      }
      if (previousBallB.maxY <= blockB.minY) {
        collision.top = true
      }
    }

    if (collision.top || collision.bottom || collision.left || collision.right) {
      this.blockWasHit(block)
    }

    return collision
  }

  private renderAimFromX() {
    if (!this.state.aimFromX) { return }
    
    const ball = new Ball(
      this.state.aimFromX,
      this.canvasSize.height,
      0,
      0,
      false
    )
    this.renderBall(ball)
  }
}

