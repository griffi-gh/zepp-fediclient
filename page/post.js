import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import PostComponent from '../utils/components/PostComponent.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import SeparatorComponent from '../utils/components/SeparatorComponent.js';
//import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder, preserveData } = getApp()._options.globalData;

let currentPostId;

let post_component,
    separator_component,
    post_feed_component;

let lifecycle = false;

function on_post_loaded(data) {
  if (!lifecycle) return;

  preserveData.data = data;

  hmUI.updateStatusBarTitle(i18n("post"));

  const man = new LayoutManager(safeArea);

  post_component = new PostComponent(data.post);
  separator_component = new SeparatorComponent(10);
  post_feed_component = new PostFeedComponent(data.descendants);

  post_component.layout(man);
  separator_component.layout(man);
  post_feed_component.layout(man);
}

Page({
  onInit(param) {
    lifecycle = true;
    if (!param) {
      throw new Error("param is required");
    }
    const { goto_post } = JSON.parse(param);
    currentPostId = goto_post;
  },
  build() {
    hmUI.setLayerScrolling(true);

    if (preserveData.data) {
      console.log("restoring state");
      on_post_loaded(preserveData.data);
    } else {
      console.log("fetching post id " + currentPostId);
      hmUI.updateStatusBarTitle(i18n("loading"));
      messageBuilder
        .request({
          request: "fetchPost",
          id: currentPostId,
          andDescendants: true,
        })
        .then(data => on_post_loaded(data));
    }
  },
  onDestroy() {
    lifecycle = false;
    if (post_component) post_component.delete();
    if (post_feed_component) post_feed_component.delete();
  }
});
