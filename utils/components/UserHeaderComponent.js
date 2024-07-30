import FullClickHelper from '../full_click.js';
import { CleanupHelper } from '../layout.js';
import { gotoUser } from '../navigation.js';
import { textSize } from './../util.js';
import InternetImageComponent from "./InternetImageComponent";

const PROFILE_PIC_SIZE = 28;

// XX username
// XX @acct@domain.name
export default class UserHeaderComponent {
  constructor(username, acct, profile_pic = null, on_click_goto_acct_id = null) {
    this.username = username;
    this.acct = acct;
    this.profile_pic = profile_pic;
    this.on_click_goto_acct_id = on_click_goto_acct_id;

    this.clean = new CleanupHelper();

    if (this.profile_pic) {
      this.netimg_component = new InternetImageComponent(
        this.profile_pic,
        PROFILE_PIC_SIZE,
        PROFILE_PIC_SIZE,
      );
      this.clean.addComponent(this.netimg_component);
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

    let text_username = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w - sub_area_w,
      h: 32,
      text: this.username,
      text_size: USERNAME_FONT_SIZE,
      color: 0xffffff,
      align_h: hmUI.align.LEFT,
    });
    this.clean.addWidget(text_username);

    man.account(
      0,
      textSize(this.username, USERNAME_FONT_SIZE, 0).height +
      USERNAME_HANDLE_PADDING
    );

    let text_acct = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w - sub_area_w,
      h: 32,
      text: this.acct,
      text_size: HANDLE_FONT_SIZE,
      color: 0xAAAAAA,
      align_h: hmUI.align.LEFT,
    });
    this.clean.addWidget(text_acct);

    man.account(
      0,
      textSize(this.acct, HANDLE_FONT_SIZE, 0).height +
      USER_CONTENT_PADDING,
    );

    man.resetX();

    //TODO make other parts clickable (use group)
    if (this.on_click_goto_acct_id) {
      let click_helper0 = new FullClickHelper(
        text_username,
        this.usrHeaderClick.bind(this)
      );
      let click_helper1 = new FullClickHelper(
        text_acct,
        this.usrHeaderClick.bind(this)
      );

      click_helper0.attach();
      click_helper1.attach();

      this.clean.addAttachment(click_helper0);
      this.clean.addAttachment(click_helper1);
    }
  }

  usrHeaderClick() {
    if (this._deleted) return;
    console.log("usrHeaderClick");
    // const target_post = this.post.reblog ?? this.post;
    gotoUser(this.on_click_goto_acct_id);
  }

  delete() {
    this._deleted = true;
    this.clean.delete();
    this.netimg_component = null;
  }
}
