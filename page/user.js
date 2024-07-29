import { gettext as i18n } from 'i18n';
import { safeArea, textSize, wrapText } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { callMeOnScreenInit } from "../utils/navigation";
import LoadingAnimationComponent from "../utils/components/LoadingAnimationComponent";
import PostFeedComponent from "../utils/components/PostFeedComponent";
import UserHeaderComponent from '../utils/components/UserHeaderComponent.js';
import SeparatorComponent from '../utils/components/SeparatorComponent.js';
import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let lifecycle = false;

let acct_id = null;

let
  loading_component,
  _components = [],
  _widgets = [];

function on_data_ready(data) {
  if (!lifecycle) return;
  if (loading_component) {
    loading_component.delete();
    loading_component = null;
  }

  const man = new LayoutManager(safeArea);
  const { user_header, user_posts } = data;

  if (user_header) {
    // build user header
    // TODO move this out to a component

    const user_header_component = new UserHeaderComponent(user_header.username, user_header.acct, user_header.profile_pic);
    user_header_component.layout(man);
    _components.push(user_header_component);

    if (user_header.description) {
      const CONTENT_TEXT_SIZE = 16;
      const wt = wrapText(user_header.description, CONTENT_TEXT_SIZE);
      const sz = textSize(wt, CONTENT_TEXT_SIZE).height;
      _widgets.push(hmUI.createWidget(hmUI.widget.TEXT, {
        x: man.x,
        y: man.y,
        w: man.area.w,
        h: sz,
        text: wt,
        text_size: CONTENT_TEXT_SIZE,
        color: 0xFFFFFF,
        align_h: hmUI.align.LEFT,
        text_style: hmUI.text_style.ELLIPSIS,
      }));
      man.account(0, sz);
    };

    const separator_component = new SeparatorComponent(5);
    separator_component.layout(man);
    _components.push(separator_component);
  }

  if (user_posts) {
    // build user posts
    const post_feed_component = new PostFeedComponent(user_posts);
    post_feed_component.layout(man);
    _components.push(post_feed_component);

    //TODO pagination

    const no_posts_at_all = user_posts.length === 0;
    const no_more_posts_loaded_component = new NoMorePostsLoadedComponent(no_posts_at_all);
    no_more_posts_loaded_component.layout(man);
    _components.push(no_more_posts_loaded_component);
  }
}

Page({
  onInit(param) {
    callMeOnScreenInit();
    lifecycle = true;

    if (param) {
      const { goto_acct_id } = JSON.parse(param);
      if (goto_acct_id) acct_id = goto_acct_id;
    }
  },
  build() {
    hmUI.updateStatusBarTitle(i18n("user"));
    hmUI.setLayerScrolling(true);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    messageBuilder
      .request({
        request: "fetchUser",
        acct_id,
        need_user_header: true,
        need_user_posts: true,
      })
      .then(on_data_ready);
  },
  onDestroy() {
    lifecycle = false;
    if (loading_component) {
      loading_component.delete();
      loading_component = null;
    }
    for (const c of _components) {
      c.delete();
    }
    for (const w of _widgets) {
      hmUI.deleteWidget(w);
    }
  },
});
