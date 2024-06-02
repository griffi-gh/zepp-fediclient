import { textSize } from './../util.js';
import InternetImageComponent from "./InternetImageComponent";

const PROFILE_PIC_SIZE = 28;

// XX username
// XX @acct@domain.name
export default class UserHeaderComponent {
  constructor(username, acct, profile_pic = null) {
    this.username = username;
    this.acct = acct;
    this.profile_pic = profile_pic;
    if (this.profile_pic) {
      this.netimg_component = new InternetImageComponent(
        this.profile_pic,
        PROFILE_PIC_SIZE,
        PROFILE_PIC_SIZE,
      );
    }
  }

  layout(man) {
    const PROFILE_PIC_Y_OFFSET = 6;
    const PROIFLE_PIC_X_PADDING = 4;
    const USERNAME_FONT_SIZE = 16;
    const USERNAME_HANDLE_PADDING = -5;
    const HANDLE_FONT_SIZE = 14;
    const USER_CONTENT_PADDING = 0;

    if (this.profile_pic) {
      man.pushReset();
      man.y += PROFILE_PIC_Y_OFFSET;
      this.netimg_component.layout(man);
      man.resetXY();
      man.popReset();
    } else {
      this._img = hmUI.createWidget(hmUI.widget.IMG, {
        src: "user-generic.png",
        x: man.x,
        y: man.y + PROFILE_PIC_Y_OFFSET,
        w: PROFILE_PIC_SIZE,
        h: PROFILE_PIC_SIZE,
      });
    }

    man.account(PROFILE_PIC_SIZE + PROIFLE_PIC_X_PADDING, 0);
    const sub_area_w = PROFILE_PIC_SIZE + PROIFLE_PIC_X_PADDING;

    this._text_username = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w - sub_area_w,
      h: 32,
      text: this.username,
      text_size: USERNAME_FONT_SIZE,
      color: 0xffffff,
      align_h: hmUI.align.LEFT,
    });

    man.account(
      0,
      textSize(this.username, USERNAME_FONT_SIZE, 0).height +
      USERNAME_HANDLE_PADDING
    );

    this._text_acct = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w - sub_area_w,
      h: 32,
      text: this.acct,
      text_size: HANDLE_FONT_SIZE,
      color: 0xAAAAAA,
      align_h: hmUI.align.LEFT,
    });

    man.account(
      0,
      textSize(this.acct, HANDLE_FONT_SIZE, 0).height +
      USER_CONTENT_PADDING,
    );

    man.resetX();
  }

  delete() {
    if (this._img) hmUI.deleteWidget(this._img);
    if (this.netimg_component) this.netimg_component.delete();
    hmUI.deleteWidget(this._text_username);
    hmUI.deleteWidget(this._text_acct);
  }
}
