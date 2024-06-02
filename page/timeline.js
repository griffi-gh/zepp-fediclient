import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder, preserveData } = getApp()._options.globalData;

let currentTimeline = "local";

let post_feed_component,
    no_more_posts_loaded_component;

let lifecycle = false;

function on_post_data_ready(data) {
  if (!lifecycle) return;

  preserveData.data = data;

  const timeline_title = i18n("timeline_" + currentTimeline);
  hmUI.updateStatusBarTitle(timeline_title);

  const man = new LayoutManager(safeArea);

  post_feed_component = new PostFeedComponent(data);
  no_more_posts_loaded_component = new NoMorePostsLoadedComponent();

  post_feed_component.layout(man);
  no_more_posts_loaded_component.layout(man);
}

Page({
  onInit(param) {
    lifecycle = true;

    if (param) {
      const { goto_timeline } = JSON.parse(param);
      if (goto_timeline) {
        currentTimeline = goto_timeline;
      }
    }
  },

  build() {
    hmUI.setLayerScrolling(true);
    if (preserveData.data) {
      console.log("restoring state");
      on_post_data_ready(preserveData.data);
    } else {
      hmUI.updateStatusBarTitle(i18n("loading"));
      messageBuilder
        .request({
          request: "fetchTimeline",
          timeline: currentTimeline,
        })
        .then(data => on_post_data_ready(data));
    }
  },

  onDestroy() {
    lifecycle = false;
    if (post_feed_component) post_feed_component.delete();
    if (no_more_posts_loaded_component) no_more_posts_loaded_component.delete();
  }
});
