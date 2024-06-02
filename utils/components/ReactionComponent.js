import { textSize } from './../util.js';

export const DEFAULT_REACT_COLOR_INACTIVE = 0xa3a3a3;

export default class ReactionComponent {
  constructor(
    count = 0,
    active = false,
    src_inactive = "heart.png",
    src_active = "heart-active.png",
    color_inactive = DEFAULT_REACT_COLOR_INACTIVE,
    color_active = 0xee1111,
  ) {
    this.count = count ?? 0;
    this.active = !!active;
    this.src_active = src_active;
    this.src_inactive = src_inactive;
    this.color_active = color_active;
    this.color_inactive = color_inactive;
  }

  layout(man) {
    const ICON_ALIGNMENT_MAGIC = 6; //there's no meaning to this, it just looks good
    const REACT_ICN_SIZE = 16;
    const REACT_ICN_TEXT_PADDING = 4;
    const REACT_TEXT_SIZE = 18;

    const sz_likes_text = textSize(this.count.toString(), REACT_TEXT_SIZE);
    this._endl_height = sz_likes_text.height;
    this._img = hmUI.createWidget(hmUI.widget.IMG, {
      src: this.active ? this.src_active : this.src_inactive,
      x: man.x,
      y: man.y + ICON_ALIGNMENT_MAGIC,
      w: REACT_ICN_SIZE,
      h: REACT_ICN_SIZE,
    });
    man.account(REACT_ICN_SIZE + REACT_ICN_TEXT_PADDING, 0);
    this._text = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: 32,
      text: this.count.toString(),
      text_size: REACT_TEXT_SIZE,
      color: this.active ? this.color_active : this.color_inactive,
    });
    man.account(sz_likes_text.width + 4, 0);
  }

  endl(man) {
    //TODO remove hardcoded height
    man.account(0, this._endl_height);
    man.resetX();
  }

  delete() {
    hmUI.deleteWidget(this._img);
    hmUI.deleteWidget(this._text);
  }
}
