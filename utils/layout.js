import { safeArea } from "./../utils/util.js";

export class LayoutManager {
  constructor(area = safeArea) {
    this.area = area;
    this.x = this.area.x0;
    this.y = this.area.y0;
    this.resetStack = [
      [this.area.x0, this.area.y0],
    ];
  }

  account(x, y) {
    this.x += x;
    this.y += y;
  }

  resetX() {
    this.x = this.resetStack[this.resetStack.length - 1][0];
  }

  resetY() {
    this.y = this.resetStack[this.resetStack.length - 1][1];
  }

  pushReset(x = this.x, y = this.y) {
    this.resetStack.push([x, y]);
  }

  popReset() {
    this.resetStack.pop();
  }
}
