// Constants/Settings

const fps = 144;
const canvasSize = {
  width: 600,
  height: 600,
}
var state = {
  startScreen: true,
  mouseX: null,
  mouseY: null,
  aiming: true,
  blocks: [],
  balls: [],
  level: 0,
  lost: false,
  aimFromX: null,
  lastBallShot: new Date(),
}
const rows = 10
const columns = 10
const ballRadius = 7
// ballVelocity is in pixels per second
const ballVelocity = 900
// delayBetweenBalls is in ms
const delayBetweenBalls = 30

// Get html elements

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// Start game

main()

// Functions

function setState(newState) {
  const oldState = {...state};
  state = {
    ...state,
    ...newState,
  }
  stateDidChange(oldState)
}

function stateDidChange(oldState) {
  if (oldState.level !== state.level) {
    levelDidChange()
    updateUI()
  }
}

function main() {
  gameDidStart()
}

function gameDidStart() {
  resizeCanvas()
  setState({aimFromX: canvas.width / 2})
  handleMouseEvents()
  startRenderLoop()
}

function resizeCanvas() {
  canvas.width = canvasSize.width
  canvas.height = canvasSize.height
}

function handleMouseEvents() {
  canvas.addEventListener('mouseenter', listenToMouseMoveEvents)
  canvas.addEventListener('mouseenter', listenToMouseClickEvents)
  canvas.addEventListener('mouseleave', stopListeningToMouseMoveEvents)
  canvas.addEventListener('mouseleave', stopListeningToMouseClickEvents)
  canvas.addEventListener('mouseleave', () => {setState({mouseX: null, mouseY: null})})
}

function listenToMouseMoveEvents() {
  canvas.addEventListener('mousemove', setMousePositionState)
}

function stopListeningToMouseMoveEvents() {
  canvas.removeEventListener('mousemove', setMousePositionState)
}

function setMousePositionState(event) {
  setState({
    mouseX: event.clientX - canvas.offsetLeft,
    mouseY: event.clientY - canvas.offsetTop,
  })
}

function listenToMouseClickEvents() {
  canvas.addEventListener('click', setClickPositionState)
}

function stopListeningToMouseClickEvents() {
  canvas.removeEventListener('click', setClickPositionState)
}

function setClickPositionState(event) {
  setState({
    clickX: event.clientX - canvas.offsetLeft,
    clickY: event.clientY - canvas.offsetTop,
  })
}

function startRenderLoop() {
  setInterval(render, (1000 / fps))
}

function render() {
  // Clear entire canvas
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

  // Render content from scratch
  if (state.startScreen) {
    renderStartScreen()
  } else if (state.lost) {
    renderGameOverScreen()
  } else {
    renderGame()
  }

  // Clear mouse clicks
  setState({
    clickX: null,
    clickY: null,
  })
}

function renderStartScreen() {
  renderCenteredButton('Start Game', () => {
    setState({startScreen: false})
  })
}

function renderGameOverScreen() {
  renderCenteredButton('Play Again', () => {
    setState({
      lost: false,
      blocks: [],
      level: 1,
    })
  })
}

function renderGame() {
  if (state.level === 0) {
    setState({level: 1})
  }

  checkForLoseCondition()
  checkForNextLevel()
  renderBlocks()
  renderAimFromX()

  if (state.aiming) {
    renderAimer()
  } else {
    repositionBalls()
    renderBalls()
  }
}

function renderBlocks() {
  state.blocks.forEach(renderBlock)
}

function repositionBalls() {
  const newBalls = state.balls.map(ball => {
    ball.x = ball.x + (ball.xv / fps)
    ball.y = ball.y + (ball.yv / fps)

    // Wall collisions
    if (ball.x - ballRadius < 0) {
      ball.xv = -ball.xv
    }
    if (ball.x + ballRadius > canvas.width) {
      ball.xv = -ball.xv
    }
    if (ball.y - ballRadius < 0) {
      ball.yv = -ball.yv
    }
    if (ball.y - ballRadius > canvas.height) {
      ball.dead = true
      if (!state.aimFromX) {
        setState({aimFromX: ball.x})
      }
    }

    // Block collisions
    state.blocks.forEach(block => {
      const collision = blockBallCollision(block, ball)
      if (collision.top || collision.bottom) {
        ball.yv = -ball.yv
      }
      if (collision.left || collision.right) {
        ball.xv = -ball.xv
      }
    })

    return ball
  })

  setState({balls: newBalls})
}

function renderBalls() {
  state.balls.forEach(renderBall)
}

function renderBlock(block) {
  const x = columnWidth() * block.column
  const y = rowHeight() * (block.row + 1) 
  const w = columnWidth()
  const h = rowHeight()

  ctx.fillStyle = blockColor(block)
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'white'
  ctx.strokeRect(x, y, w, h)

  const fontSize = 12
  const font = `${fontSize}px sans-serif`
  const text = `${block.hits}`
  const textWidth = ctx.measureText(text).width
  const fx = x + ((w - textWidth) / 2)
  const fy = y + ((h - fontSize) / 2) + fontSize
  ctx.fillStyle = 'white'
  ctx.fillText(text, fx, fy)
}

function renderAimer() {
  const fromX = state.aimFromX
  const fromY = canvas.height

  // Handle hover
  if (state.mouseX) {
    const toX = state.mouseX
    const toY = state.mouseY

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.closePath()
    ctx.strokeStyle = 'black'
    ctx.stroke()
  }

  // Handle click
  if (state.clickX) {
    shoot()
  }
}

function renderBall(ball) {
  if (ball.dead) { return }
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI, false)
  ctx.fillStyle = 'black'
  ctx.fill()
}

function levelDidChange() {
  const blockCount = getRandomInt(1, columns - 1)
  const newBlocks = state.blocks.map(block => {
    block.row += 1
    return block
  })
  const filledColumns = []
  for(var i = 0; i < blockCount; i++) {
    var column = getRandomInt(0, columns)
    while(filledColumns.indexOf(column) !== -1) {
      column = getRandomInt(0, columns)
    }
    filledColumns.push(column)
    newBlocks.push({
      row: 0,
      column: column,
      hits: state.level,
    })
  }
  setState({blocks: newBlocks})
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function checkForLoseCondition() {
  state.blocks.forEach((block) => {
    if (block.row === rows - 1) {
      setState({lost: true})
    }
  });
}

function checkForNextLevel() {
  if (state.aiming) { return }

  var allBallsDead = true

  state.balls.forEach(ball => {
    if (!ball.dead) {
      allBallsDead = false
    }
  })

  if (allBallsDead) {
    setState({
      balls: [],
      aiming: true,
      level: state.level + 1,
    })
  }
}

function shoot() {
  const aimDeltaX = state.clickX - state.aimFromX
  const aimDeltaY = state.clickY - canvas.height

  const aimDeltaSum = Math.abs(aimDeltaY) + Math.abs(aimDeltaX)

  const xv = (aimDeltaX / aimDeltaSum) * ballVelocity
  const yv = (aimDeltaY / aimDeltaSum) * ballVelocity

  const newBall = {
    x: state.aimFromX,
    y: canvas.height,
    xv: xv,
    yv: yv,
    dead: false,
  }

  for(var i = 0; i < state.level; i++) {
    setTimeout(() => {
      const newBalls = [...state.balls]
      const newBallClone = {...newBall}
      newBalls.push(newBallClone)
      setState({balls: newBalls})
    }, i * delayBetweenBalls)
  }

  setState({
    aiming: false,
    aimFromX: null,
  })
}

function renderCenteredButton(text, clickHandler) {
  const fontSize = 16
  const font = `${fontSize}px sans-serif`

  const textWidth = ctx.measureText(text).width
  const x = (canvasSize.width - textWidth) / 2
  const y = (canvasSize.height - fontSize) / 2
  ctx.font = font

  const padding = 10
  const bx = x - padding
  const by = y - padding - fontSize + 2
  const bw = textWidth + padding * 2
  const bh = fontSize + padding * 2

  // If hover over button
  if (
    state.mouseX &&
    state.mouseX > bx && 
    state.mouseX < bx + bw &&
    state.mouseY > by &&
    state.mouseY < by + bh
  ) {
    ctx.fillStyle = 'grey'
  } else {
    ctx.fillStyle = 'white'
  }

  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeStyle = 'black'
  ctx.strokeRect(bx, by, bw, bh)
  ctx.fillStyle = 'black'
  ctx.fillText(text, x, y)

  // If click on button
  if (
    state.clickX &&
    state.clickX > bx && 
    state.clickX < bx + bw &&
    state.clickY > by &&
    state.clickY < by + bh
  ) {
    clickHandler()
  }
}

function blockBoundaries(block) {
  const x = columnWidth() * block.column
  const y = rowHeight() * (block.row + 1)

  return {
    minX: x,
    minY: y,
    maxX: x + columnWidth(),
    maxY: y + rowHeight(),
  }
}

function ballBoundaries(ball) {
  return {
    minX: ball.x - ballRadius,
    minY: ball.y - ballRadius,
    maxX: ball.x + ballRadius,
    maxY: ball.y + ballRadius,
  }
}

function blockWasHit(hitBlock) {
  const newBlocks = []
  state.blocks.forEach(block => {
    if (hitBlock === block) {
      const hits = block.hits - 1
      if (hits !== 0) {
        newBlocks.push({
          ...block,
          hits: hits,
        })
      }
    } else {
      newBlocks.push(block)
    }
  })
  setState({blocks: newBlocks})
}

function rowHeight() {
  return canvas.height / (rows + 1)
}

function columnWidth() {
  return canvas.width / columns
}

function blockBallCollision(block, ball) {
  const blockB = blockBoundaries(block)
  const ballB = ballBoundaries(ball)

  var collision = {
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
    const previousBallB = ballBoundaries({
      x: previousBallX,
      y: previousBallY,
    })
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
    blockWasHit(block)
  }

  return collision
}

function updateUI() {
  document.getElementById('levelCount').innerHTML = state.level
  document.getElementById('ballCount').innerHTML = state.level
}

function blockColor(block) {
  const r = Math.min(Math.floor((block.hits - 1) * 10), 255)
  const g = Math.min(0, 255)
  const b = Math.max(Math.floor((255 - block.hits) * 10), 0)

  return `rgb(${r}, ${g}, ${b})`
}


function renderAimFromX() {
  if (!state.aimFromX) { return }
  
  const ball = {
    x: state.aimFromX,
    y: canvas.height,
    xv: 0,
    yv: 0,
    dead: false,
  }
  renderBall(ball)
}

