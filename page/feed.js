import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit, reloadFeed } from '../utils/navigation.js';
import { LayoutManager } from '../utils/layout.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';
import ButtonComponent from '../utils/components/ButtonComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let param;

let loading_component,
    post_feed_component,
    load_more_button_component;

let lifecycle = false;

function on_post_data_ready(data) {
  if (!lifecycle) return;

  loading_component.delete();

  const man = new LayoutManager(safeArea);

  post_feed_component = new PostFeedComponent(data);
  load_more_button_component = new ButtonComponent(
    i18n("load_more"),
    () => {
      if (!lifecycle) return;
      const last_id = data[data.length - 1].id;
      const new_param = { ...param };
      new_param.max_id = last_id;
      new_param.page_idx++;
      reloadFeed(new_param);
    },
    -1, 70, //w, h,
  );
  post_feed_component.layout(man);
  load_more_button_component.layout(man);
}

Page({
  onInit(param_json) {
    callMeOnScreenInit();
    lifecycle = true;
    param = JSON.parse(param_json);
  },

  build() {
    console.log("Building feed '" + JSON.stringify(param.feed) + "' page " + param.page_idx);

    let page_title, request;
    switch (param.feed.type) {
      case "timeline":
        page_title = i18n("timeline_" + param.feed.timeline);
        request = {
          request: "fetchTimeline",
          timeline: param.feed.timeline,
          maxId: param.max_id,
        };
        break;
      case "bookmarks":
        page_title = i18n("bookmarks");
        request = {
          request: "fetchBookmarks",
          maxId: param.max_id,
        };
        break;
    }

    const page_footer = (param.page_idx - 1) ? (" (" + param.page_idx + ")") : "";
    hmUI.updateStatusBarTitle(page_title + page_footer);
    hmUI.setLayerScrolling(true);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    messageBuilder
      .request(request)
      .then(on_post_data_ready);
  },

  onDestroy() {
    lifecycle = false;
    if (loading_component) {
      loading_component.delete();
      loading_component = null;
    }
    if (post_feed_component) {
      post_feed_component.delete();
      post_feed_component = null;
    }
    if (load_more_button_component) {
      load_more_button_component.delete();
      load_more_button_component = null;
    }
  }
})
