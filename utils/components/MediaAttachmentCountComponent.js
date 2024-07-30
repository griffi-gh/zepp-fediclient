import { textSize } from "../util";

const ICON_SIZE = 16;
const LABEL_TEXT_TEMPLATE = attachments => `${attachments} attachment${attachments > 1 ? "s" : ""}`;
const LABEL_TEXT_SIZE = 14;

export default class MediaAttachmentCountComponent {
  constructor(count) {
    this.count = count;
  }

  layout(man) {
    const label_text = LABEL_TEXT_TEMPLATE(this.count);
    const sz_label_text = textSize(label_text, LABEL_TEXT_SIZE);
    this._img = hmUI.createWidget(hmUI.widget.IMG, {
      src: "attachments.png",
      x: man.x,
      y: man.y,
      w: ICON_SIZE,
      h: ICON_SIZE,
    });
    this._text = hmUI.createWidget(hmUI.widget.TEXT, {
      text: label_text,
      text_size: LABEL_TEXT_SIZE,
      color: 0xffffff,
      x: man.x + ICON_SIZE + 4,
      y: man.y,
      w: man.area.w,
      h: 32,
    });
    man.account(0, Math.max(ICON_SIZE, sz_label_text.height));
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
