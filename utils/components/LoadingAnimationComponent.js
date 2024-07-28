export default class LoadingAnimationComponent {
  constructor() {}

  layout(man, acct_h = false, acct_v = false) {
    this._img = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: man.x,
      y: man.y,
      anim_path: "loading-animation",
      anim_prefix: "animation",
      anim_ext: "png",
      anim_size: 10,
      anim_fps: 15,
      repeat_count: 0,
      anim_repeat: true,
      anim_status: hmUI.anim_status.START, //3?
    });
    if (acct_h) this.account_h(man);
    if (acct_v) this.account_v(man);
  }

  account_h(man) {
    man.account(48, 0);
  }

  account_v(man) {
    man.account(0, 48)
  }

  delete() {
    //this._img.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.STOP);
    this._deleted = true;
    if (this._img) {
      hmUI.deleteWidget(this._img);
      this._img = null;
    }
  }
}
