import { CleanupHelper } from '../layout.js';
import { textSize, wrapText } from '../util.js';
import { gotoPost } from '../navigation.js';
import FullClickHelper from '../full_click.js';
import ReblogUserHeaderComponent from "./ReblogUserHeaderComponent.js";
import UserHeaderComponent from "./UserHeaderComponent.js";
import PostReactionsBlockComponent from "./PostReactionsBlockComponent.js";

//TODO support quoted posts
//Are those just reblogs with content attached?
//XXX: check how masto/sharkey do it

const TEXT_SIZE_NORMAL = 18;
const TEXT_SIZE_ENLARGED = 22;

// Post component, looks like:
// ([reblog_user_header]) if reblog
// [user_header]
// [post_content]
// [react_block]
export default class PostComponent {
  constructor(post, {
    body_clickable = false,
    user_clickable = false,
    embiggen = false,
  } = {}) {
    this.post = post;
    this.on_click_go_to_post_page = !!body_clickable;
    this.embiggen = !!embiggen;

    this.clean = new CleanupHelper();

    if (post.reblog) {
      this.reblog_user_header_component = new ReblogUserHeaderComponent(
        post.username,
      );
      this.clean.addComponent(this.reblog_user_header_component);
    }

    const target_post = post.reblog ?? post;

    this.user_header_component = new UserHeaderComponent(
      target_post.username,
      target_post.acct,
      target_post.profile_pic,
      user_clickable ? target_post.acct_id : null,
    );
    this.clean.addComponent(this.user_header_component);

    this.post_reactions_block_component = new PostReactionsBlockComponent(
      target_post.likes,
      target_post.like_active,
      target_post.reblogs,
      target_post.reblog_active,
      target_post.replies,
    );
    this.clean.addComponent(this.post_reactions_block_component);
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
    const content_text_size = this.embiggen ? TEXT_SIZE_ENLARGED : TEXT_SIZE_NORMAL;

    const wt = wrapText(target_post.content, content_text_size);
    const sz = textSize(wt, content_text_size).height;
    const body_widget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: sz,
      text: wt,
      text_size: content_text_size,
      color: 0xFFFFFF,
      align_h: hmUI.align.LEFT,
      text_style: hmUI.text_style.ELLIPSIS,
    });
    this.clean.addWidget(body_widget);

    if (this.on_click_go_to_post_page) {
      let post_click_helper = new FullClickHelper(
        body_widget,
        this.postClick.bind(this)
      );
      post_click_helper.attach();
      this.clean.addAttachment(post_click_helper);
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
    this.clean.delete();
    this.clean = null;
    this.user_header_component = null;
    this.post_reactions_block_component = null;
  }
}
