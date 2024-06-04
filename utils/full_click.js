// Ensures that click is not a swipe

export default class FullClickHelper {
  constructor(wgt, cb) {
    this.wgt = wgt;
    this.cb = cb;
  }

  attach() {
    this._clickDownCb = meta => {
      this._ameta = meta;
    }
    this._clickUpCb = meta => {
      if (!this._ameta) return;
      if (this._ameta.x == meta.x && this._ameta.y == meta.y) {
        this.cb(meta, this._ameta);
      }
    }
    this.wgt.addEventListener(hmUI.event.CLICK_DOWN, this._clickDownCb);
    this.wgt.addEventListener(hmUI.event.CLICK_UP, this._clickUpCb);
  }

  detach() {
    this.wgt.removeEventListener(hmUI.event.CLICK_DOWN, this._clickDownCb);
    this.wgt.removeEventListener(hmUI.event.CLICK_UP, this._clickUpCb);
  }
}
