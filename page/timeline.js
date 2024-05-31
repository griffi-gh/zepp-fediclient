import { gettext as i18n } from 'i18n';
import { deviceInfo, safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { PostFeedComponent } from '../utils/components.js';

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

        hmUI.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: man.y,
          w: deviceInfo.width,
          h: deviceInfo.height / 4,
          text: i18n("no_more_posts"),
          text_size: 18,
          color: 0xAAAAAA,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
        });
      });
  }
});
