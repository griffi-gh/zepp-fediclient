import { ensureImageCached } from './../../utils/image_cache.js';
import { USE_INTERNET_IMAGE } from '../../configuration.js';

//TODO image lazy loading

export default class InternetImageComponent {
  constructor(
    src,
    width,
    height,
    client_param = {},
    server_param = null,
    on_load = _ => {}
  ) {
    this.src = src;
    this.width = width;
    this.height = height;
    this.client_param = client_param;
    this.server_param = server_param;
    this.on_load = on_load;
  }

  layout(man) {
    if (USE_INTERNET_IMAGE) {
      const man_x = man.x;
      const man_y = man.y;
      ensureImageCached(
        this.src,
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
          this.on_load(pth);
        },
        this.width,
        this.height,
        this.client_param,
        this.server_param,
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
