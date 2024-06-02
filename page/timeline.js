import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let currentTimeline = "local";

let post_feed_component,
    no_more_posts_loaded_component;

let lifecycle = false;

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
    const man = new LayoutManager(safeArea);

    hmUI.updateStatusBarTitle(i18n("loading"));
    hmUI.setLayerScrolling(true);

    messageBuilder
      .request({
        request: "fetchTimeline",
        timeline: currentTimeline,
      })
      .then(data => {
        if (!lifecycle) return;

        const timeline_title = i18n("timeline_" + currentTimeline);
        hmUI.updateStatusBarTitle(timeline_title);

        post_feed_component = new PostFeedComponent(data);
        no_more_posts_loaded_component = new NoMorePostsLoadedComponent();

        post_feed_component.layout(man);
        no_more_posts_loaded_component.layout(man);
      });
  },
  onDestroy() {
    lifecycle = false;
    if (post_feed_component) post_feed_component.delete();
    if (no_more_posts_loaded_component) no_more_posts_loaded_component.delete();
  }
});
