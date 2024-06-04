import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { callMeOnScreenInit } from '../utils/navigation.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';
import PostComponent from '../utils/components/PostComponent.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import SeparatorComponent from '../utils/components/SeparatorComponent.js';
//import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let currentPostId;

let loading_component,
    post_component,
    separator_component,
    post_feed_component;

let lifecycle = false;

function on_post_loaded(data) {
  if (!lifecycle) return;

  loading_component.delete();

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
    callMeOnScreenInit();
    lifecycle = true;
    if (!param) {
      throw new Error("param is required");
    }
    const { goto_post } = JSON.parse(param);
    currentPostId = goto_post;
  },
  build() {
    hmUI.updateStatusBarTitle(i18n("post"));
    hmUI.setLayerScrolling(true);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    console.log("fetching post id " + currentPostId);
    messageBuilder
      .request({
        request: "fetchPost",
        id: currentPostId,
        andDescendants: true,
      })
      .then(on_post_loaded);
  },
  onDestroy() {
    lifecycle = false;
    if (post_component) post_component.delete();
    if (post_feed_component) post_feed_component.delete();
  }
});
