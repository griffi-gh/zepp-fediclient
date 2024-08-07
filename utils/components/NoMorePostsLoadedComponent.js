import { gettext as i18n } from 'i18n';

//XXX: UNUSED

export default class NoMorePostsLoadedComponent {
  constructor(no_posts_at_all) {
    this.no_posts_at_all = no_posts_at_all;
  }

  layout(man) {
    this._text = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: man.y,
      w: man.area.w,
      h: man.area.h / 4,
      text: i18n(this.no_posts_at_all ? "no_posts" : "no_more_posts"),
      text_size: 18,
      color: 0xAAAAAA,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
    man.account(0, man.area.h / 4);
  }

  delete() {
    this._deleted = true;
    if (this._text) {
      hmUI.deleteWidget(this._text);
      this._text = null;
    }
  }
}
