import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import {
  PostFeedComponent,
  NoMorePostsLoadedComponent,
} from '../utils/components.js';

const { messageBuilder } = getApp()._options.globalData;

let currentTimeline = "local";

Page({
  onInit(param) {
    if (param) {
      const { goto_timeline } = JSON.parse(param);
      if (goto_timeline) {
        currentTimeline = goto_timeline;
      }
    }
  },
  build() {
    const man = new LayoutManager(safeArea);

    hmUI.setLayerScrolling(true);
    // const timeline_title =
    //   currentTimeline.charAt(0).toUpperCase() +
    //   currentTimeline.slice(1);
    const timeline_title = i18n("timeline_" + currentTimeline);
    hmUI.updateStatusBarTitle(timeline_title);

    messageBuilder
      .request({
        request: "fetchTimeline",
        timeline: currentTimeline,
      })
      .then(data => {
        (new PostFeedComponent(data))
          .layout(man);
        (new NoMorePostsLoadedComponent())
          .layout(man);
      });
  }
});
