import { textSize, wrapText } from './../util.js';
import ReblogUserHeaderComponent from "./ReblogUserHeaderComponent.js";
import UserHeaderComponent from "./UserHeaderComponent.js";
import PostReactionsBlockComponent from "./PostReactionsBlockComponent.js";

// Post component, looks like:
// ([reblog_user_header]) if reblog
// [user_header]
// [post_content]
// [react_block]
export default class PostComponent {
  constructor(post) {
    this.post = post;

    if (post.reblog) {
      this.reblog_user_header_component = new ReblogUserHeaderComponent(
        post.username,
      );
    }

    const target_post = post.reblog ?? post;

    this.user_header_component = new UserHeaderComponent(
      target_post.username,
      target_post.acct,
      target_post.profile_pic,
    );

    this.post_reactions_block_component = new PostReactionsBlockComponent(
      target_post.likes,
      target_post.like_active,
      target_post.reblogs,
      target_post.reblog_active,
      target_post.replies,
    );
  }

  layout(man) {
    const post = this.post;
    const target_post = post.reblog ?? post;

    // REBLOG HEADER
    if (post.reblog) {
      this.reblog_user_header_component.layout(man);
    }

    // USER BLOCK
    this.user_header_component.layout(man);

    // CONTENT BLOCK
    const CONTENT_TEXT_SIZE = 16;

    const wt = wrapText(target_post.content, CONTENT_TEXT_SIZE);
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
      text_style: hmUI.text_style.ELLIPSIS,
    });
    man.account(0, sz);

    //REACT BLOCK
    this.post_reactions_block_component.layout(man);
  }

  delete() {
    if (this.reblog_user_header_component) {
      this.reblog_user_header_component.delete();
    }
    this.user_header_component.delete();
    hmUI.deleteWidget(this._body);
    this.post_reactions_block_component.delete();
  }
}
