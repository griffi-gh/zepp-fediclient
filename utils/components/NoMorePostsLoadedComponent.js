import { gettext as i18n } from 'i18n';

export default class NoMorePostsLoadedComponent {
  constructor() {}

  layout(man) {
    this._text = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: man.y,
      w: man.area.w,
      h: man.area.h / 4,
      text: i18n("no_more_posts"),
      text_size: 18,
      color: 0xAAAAAA,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
    man.account(0, man.area.h / 4);
  }

  delete() {
    hmUI.deleteWidget(this._text);
  }
}
