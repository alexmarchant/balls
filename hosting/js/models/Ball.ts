export default class Ball {
  x: number
  y: number
  xv: number
  yv: number
  dead: boolean

  constructor(
    x: number,
    y: number,
    xv: number,
    yv: number,
    dead: boolean
  ) {
    this.x = x
    this.y = y
    this.xv = xv
    this.yv = yv
    this.dead = dead
  }
}
