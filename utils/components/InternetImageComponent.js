import { ensureImageCached } from './../../utils/image_cache.js';

//TODO support quoted posts
//Are those just reblogs with content attached?
//XXX: check how masto/sharkey do it

export default class InternetImageComponent {
  constructor(src, width, height) {
    this.src = src;
    this.width = width;
    this.height = height;
  }

  layout(man) {
    const man_x = man.x;
    const man_y = man.y;
    ensureImageCached(
      this.src, this.width, this.height,
      (pth) => {
        if (this._deleted) return;
        console.log("image loaded: " + pth);
        this._img = hmUI.createWidget(hmUI.widget.IMG, {
          src: pth,
          x: man_x,
          y: man_y,
          w: this.width,
          h: this.height,
        });
      }
    );
  }

  delete() {
    this._deleted = true;
    if (this._img) {
      hmUI.deleteWidget(this._img);
    }
  }
}
