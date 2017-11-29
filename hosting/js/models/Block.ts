export default class Block {
  row: number
  column: number

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }

  render(ctx: CanvasRenderingContext2D, columnWidth: number, rowHeight: number) {}
}
