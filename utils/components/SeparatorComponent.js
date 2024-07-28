// Separator component, just a line
export default class SeparatorComponent {
  constructor(height, color = 0x444444) {
    this.height = height;
    this.color = color;
  }

  layout(man) {
    this._rect = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: man.x,
      y: Math.ceil(man.y + this.height / 2) - 1,
      w: man.area.w,
      h: 2,
      color: this.color,
    });
    man.account(0, this.height);
  }

  delete() {
    this._deleted = true;
    if (this._rect) {
      hmUI.deleteWidget(this._rect);
      this._rect = null;
    }
  }
}
