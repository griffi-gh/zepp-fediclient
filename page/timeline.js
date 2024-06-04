import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit } from '../utils/navigation.js';
import { LayoutManager } from '../utils/layout.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let currentTimeline = "local";

let loading_component,
    post_feed_component,
    no_more_posts_loaded_component;

let lifecycle = false;

function on_post_data_ready(data) {
  if (!lifecycle) return;

  loading_component.delete();

  const man = new LayoutManager(safeArea);

  post_feed_component = new PostFeedComponent(data);
  no_more_posts_loaded_component = new NoMorePostsLoadedComponent();

  post_feed_component.layout(man);
  no_more_posts_loaded_component.layout(man);
}

Page({
  onInit(param) {
    callMeOnScreenInit();
    lifecycle = true;

    if (param) {
      const { goto_timeline } = JSON.parse(param);
      if (goto_timeline) {
        currentTimeline = goto_timeline;
      }
    }
  },

  build() {
    const timeline_title = i18n("timeline_" + currentTimeline);
    hmUI.updateStatusBarTitle(timeline_title);
    hmUI.setLayerScrolling(true);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    messageBuilder
      .request({
        request: "fetchTimeline",
        timeline: currentTimeline,
      })
      .then(on_post_data_ready);
  },

  onDestroy() {
    lifecycle = false;
    if (post_feed_component) post_feed_component.delete();
    if (no_more_posts_loaded_component) no_more_posts_loaded_component.delete();
  }
});
