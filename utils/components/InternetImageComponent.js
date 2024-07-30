import { ensureImageCached } from './../../utils/image_cache.js';
import { USE_INTERNET_IMAGE } from '../../configuration.js';

//TODO image lazy loading

export default class InternetImageComponent {
  constructor(src, width, height, override_path = null) {
    this.src = src;
    this.width = width;
    this.height = height;
    this.override_path = override_path;
  }

  layout(man) {
    if (USE_INTERNET_IMAGE) {
      const man_x = man.x;
      const man_y = man.y;
      ensureImageCached(
        this.src,
        this.width,
        this.height,
        this.override_path,
        (pth) => {
          if (this._deleted) return;
          console.log("image loaded: " + pth);
          this._pth = pth;
          this._img = hmUI.createWidget(hmUI.widget.IMG, {
            src: pth,
            x: man_x,
            y: man_y,
            w: this.width,
            h: this.height,
          });
        }
      );
    } else {
      this._img = hmUI.createWidget(hmUI.widget.IMG, {
        src: "user-generic.png",
        x: man.x,
        y: man.y,
        w: this.width,
        h: this.height,
      });
    }
  }

  delete() {
    this._deleted = true;
    if (this._img) {
      hmUI.deleteWidget(this._img);
      this._img = null;
    }
  }
}
