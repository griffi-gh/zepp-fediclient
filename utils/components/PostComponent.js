import { textSize, wrapText } from '../util.js';
import { gotoPost } from '../navigation.js';
import FullClickHelper from '../full_click.js';
import ReblogUserHeaderComponent from "./ReblogUserHeaderComponent.js";
import UserHeaderComponent from "./UserHeaderComponent.js";
import PostReactionsBlockComponent from "./PostReactionsBlockComponent.js";

//TODO support quoted posts
//Are those just reblogs with content attached?
//XXX: check how masto/sharkey do it

// Post component, looks like:
// ([reblog_user_header]) if reblog
// [user_header]
// [post_content]
// [react_block]
export default class PostComponent {
  constructor(post, on_click_go_to_post_page = false) {
    this.post = post;
    this.on_click_go_to_post_page = !!on_click_go_to_post_page;

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
    if (this.on_click_go_to_post_page) {
      this._click_helper = new FullClickHelper(
        this._body,
        this.postClick.bind(this)
      );
      this._click_helper.attach();
      // this._body.addEventListener(hmUI.event.CLICK_UP, this._postClickCb);
    }
    man.account(0, sz);

    //REACT BLOCK
    this.post_reactions_block_component.layout(man);
  }

  postClick(meta) {
    if (this._deleted) return;
    console.log("PostComponent.postClick");
    console.log(JSON.stringify(meta));
    const target_post = this.post.reblog ?? this.post;
    gotoPost(target_post.id);
  }

  delete() {
    this._deleted = true;
    if (this.reblog_user_header_component) {
      this.reblog_user_header_component.delete();
    }
    this.user_header_component.delete();
    if (this.on_click_go_to_post_page) {
      //this._body.removeEventListener(hmUI.event.CLICK_UP, this._postClickCb);
      this._click_helper.detach();
    }
    hmUI.deleteWidget(this._body);
    this.post_reactions_block_component.delete();
  }
}
