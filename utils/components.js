import { textSize, wrapText } from './util.js';

// XX username
// XX @acct@domain.name
export class UserHeaderComponent {
  // constructor(post) {
  //   this.username = post.username;
  //   this.acct = post.acct;
  // }

  constructor(username, acct, profile_pic = "user-generic.png") {
    this.username = username;
    this.acct = acct;
    this.profile_pic = profile_pic;
  }

  layout(man) {
    const PROFILE_PIC_SIZE = 24;
    const PROFILE_PIC_Y_OFFSET = 10;
    const PROIFLE_PIC_X_PADDING = 4;
    const USERNAME_FONT_SIZE = 16;
    const USERNAME_HANDLE_PADDING = -5;
    const HANDLE_FONT_SIZE = 14;
    const USER_CONTENT_PADDING = 0;

    this._img = hmUI.createWidget(hmUI.widget.IMG, {
      src: this.profile_pic,
      x: man.x,
      y: man.y + PROFILE_PIC_Y_OFFSET,
      w: PROFILE_PIC_SIZE,
      h: PROFILE_PIC_SIZE,
    });

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
}

export const DEFAULT_REACT_COLOR_INACTIVE = 0xa3a3a3;

export class ReactionComponent {
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
}


export class PostReactionsBlockComponent {
  constructor(
    like_count,
    like_active,
    reblog_count,
    reblog_active,
  ) {
    this.like_count_component = new ReactionComponent(
      like_count,
      like_active,
      "heart.png",
      "heart-active.png",
      DEFAULT_REACT_COLOR_INACTIVE,
      0xee1111,
    );
    this.reblog_count_component = new ReactionComponent(
      reblog_count,
      reblog_active,
      "reblog.png",
      "reblog-active.png",
      DEFAULT_REACT_COLOR_INACTIVE,
      0x22bb22,
    );
  }

  layout(man) {
    man.x = man.area.x0;
    this.like_count_component.layout(man);
    man.x = Math.max(man.x, man.area.x0 + man.area.w * 0.33);
    this.reblog_count_component.layout(man);
    this.like_count_component.endl(man);
  }
}

// Post component, looks like:
// [user_header]
// [post_content]
// [react_block]
export class PostComponent {
  constructor(post) {
    this.post = post;
    this.user_header_component = new UserHeaderComponent(
      post.username,
      post.acct,
    );
    this.post_reactions_block_component = new PostReactionsBlockComponent(
      post.likes,
      post.like_active,
      post.reblogs,
      post.reblog_active,
    );
  }

  layout(man) {
    const post = this.post;

    // USER BLOCK
    this.user_header_component.layout(man);

    // CONTENT BLOCK
    const CONTENT_TEXT_SIZE = 16;

    const wt = wrapText(post.content, CONTENT_TEXT_SIZE);
    const sz = textSize(wt, CONTENT_TEXT_SIZE).height;
    this._body = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: sz,
      text: wt,
      text_size: CONTENT_TEXT_SIZE,
      color: 0xFFFFFF,
      align_h: hmUI.align.LEFT,
    });
    man.account(0, sz);

    //REACT BLOCK
    this.post_reactions_block_component.layout(man);
  }
}

// Separator component, just a line
export class SeparatorComponent {
  constructor(height, color = 0x444444) {
    this.height = height;
    this.color = color;
  }

  layout(man) {
    this._rect = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: man.x,
      y: Math.ceil(man.y + this.height / 2) - 1,
      w: man.area.w,
      h: 2,
      color: this.color,
    });
    man.account(0, this.height);
  }
}
