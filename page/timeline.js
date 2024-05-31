import { gettext as i18n } from 'i18n';
import { deviceInfo, safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { PostFeedComponent } from '../utils/components.js';

const { messageBuilder } = getApp()._options.globalData;

// const test_posts = [
//   //https://woem.men/notes/9twtytvkvyky021f
//   {
//     username: "angel with a railgun",
//     acct: "@ezri@crimew.gay",
//     content: "they should put the little notification lights back in the phones",
//     likes: 1,
//     like_active: false,
//     reblogs: 0,
//     reblog_active: false,
//     replies: 5,
//   },
//   //https://woem.men/notes/9twsc9r4vyky01ki
//   {
//     username: "kaitlin bocchi arc real",
//     acct: "@thememesniper@wetdry.world",
//     content: "what happened is that they shipped 1GB of electron and nodejs daemons to control 2 LEDs",
//     likes: 67,
//     like_active: true,
//     reblogs: 46,
//     reblog_active: true,
//     replies: 6,
//   },
//   //https://woem.men/notes/9iq1x4tk51fo005n
//   {
//     username: "navi's kitten",
//     acct: "@fleckenstein@social.lizzy.rs",
//     content: "My Chromosomes?? What are you talking about I use Firefox",
//     likes: 727,
//     like_active: true,
//     reblogs: 419,
//     reblog_active: false,
//     replies: 3,
//   },
// ];

//stress test
// for (let i = 0; i < 17; i++)
//   test_posts.push(test_posts[test_posts.length - 1]);

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
    const timeline_title =
      currentTimeline.charAt(0).toUpperCase() +
      currentTimeline.slice(1);
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
