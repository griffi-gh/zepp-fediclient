// Smaller user header, used in reblogs
// Looks like:
// [reblog icon] [username]

export default class ReblogUserHeaderComponent {
  constructor(username) {
    this.username = username;
  }

  layout(man) {
    const REBLOG_ICON_SIZE = 16;
    const REBLOG_ICON_PADDING = 4;
    const REBLOX_ICON_Y_OFFSET = 5;
    const USERNAME_FONT_SIZE = 16;

    this._img = hmUI.createWidget(hmUI.widget.IMG, {
      src: "reblog.png",
      x: man.x,
      y: man.y + REBLOX_ICON_Y_OFFSET,
      w: REBLOG_ICON_SIZE,
      h: REBLOG_ICON_SIZE,
    });
    man.account(REBLOG_ICON_SIZE + REBLOG_ICON_PADDING, 0);
    const sub_area_w = REBLOG_ICON_SIZE + REBLOG_ICON_PADDING;

    this._text = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w - sub_area_w,
      h: 32,
      text: this.username,
      text_size: USERNAME_FONT_SIZE,
      color: 0xffffff,
      align_h: hmUI.align.LEFT,
    });

    man.resetX();
    man.account(0, REBLOG_ICON_SIZE + 4);
  }

  delete() {
    this._deleted = true;
    if (this._img) {
      hmUI.deleteWidget(this._img);
      this._img = null;
    }
    if (this._text) {
      hmUI.deleteWidget(this._text);
      this._text = null;
    }
  }
}
