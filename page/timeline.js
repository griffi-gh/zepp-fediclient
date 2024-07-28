import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit, reloadTimeline } from '../utils/navigation.js';
import { LayoutManager } from '../utils/layout.js';
import PostFeedComponent from '../utils/components/PostFeedComponent.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';
import ButtonComponent from '../utils/components/ButtonComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let currentTimeline = "local",
    max_id = null
    page_idx = 1;

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
      const last_id = data[data.length - 1].id;
      reloadTimeline(currentTimeline, last_id, page_idx + 1);
    }
  );

  post_feed_component.layout(man);
  load_more_button_component.layout(man);
}

Page({
  onInit(param) {
    callMeOnScreenInit();
    lifecycle = true;

    if (param) {
      const { goto_timeline, goto_max_id, goto_page_idx } = JSON.parse(param);
      if (goto_timeline) currentTimeline = goto_timeline;
      if (goto_max_id != null) max_id = goto_max_id;
      if (goto_page_idx != null) page_idx = goto_page_idx;
    }
  },

  build() {
    console.log("Building timeline '" + currentTimeline + "' page " + page_idx);

    const timeline_title = i18n("timeline_" + currentTimeline);
    const timeline_page_footer = (page_idx - 1) ? (" (" + page_idx + ")") : "";
    hmUI.updateStatusBarTitle(timeline_title + timeline_page_footer);
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
        maxId: max_id,
      })
      .then(on_post_data_ready);
  },

  onDestroy() {
    lifecycle = false;
    if (post_feed_component) post_feed_component.delete();
    if (load_more_button_component) load_more_button_component.delete();
  }
})
