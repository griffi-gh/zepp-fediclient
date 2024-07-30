export default class ButtonComponent {
  constructor(
    text = "Button",
    callback = () => {},
    w = -1,
    h = 32,
  ) {
    this.text = text;
    this.callback = callback;
    this.w = w;
    this.h = h;
  }

  layout(man) {
    this._button = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: man.x,
      y: man.y,
      w: (this.w == -1) ? man.area.w : this.w,
      h: this.h,
      text: this.text,
      click_func: () => {
        if (this._deleted) return;
        this.callback();
      },
    });
    man.account(0, this.h);
  }

  delete() {
    this._deleted = true;
    if (this._button) {
      hmUI.deleteWidget(this._button);
      this._button = null;
    }
  }
}
