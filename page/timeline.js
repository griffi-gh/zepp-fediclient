import { gettext as i18n } from 'i18n';
import { deviceInfo, safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { PostComponent, SeparatorComponent } from '../utils/components.js';
//const { req_helper } = getApp()._options.globalData;

const test_posts = [
  //https://woem.men/notes/9twtytvkvyky021f
  {
    username: "angel with a railgun",
    acct: "@ezri@crimew.gay",
    content: "they should put the little notification lights back in the phones",
    likes: 1,
    like_active: false,
    reblogs: 0,
    reblog_active: false,
  },
  //https://woem.men/notes/9twsc9r4vyky01ki
  {
    username: "kaitlin bocchi arc real",
    acct: "@thememesniper@wetdry.world",
    content: "what happened is that they shipped 1GB of electron and nodejs daemons to control 2 LEDs",
    likes: 67,
    like_active: true,
    reblogs: 46,
    reblog_active: true,
  },
  //https://woem.men/notes/9iq1x4tk51fo005n
  {
    username: "navi's kitten",
    acct: "@fleckenstein@social.lizzy.rs",
    content: "My Chromosomes?? What are you talking about I use Firefox",
    likes: 727,
    like_active: true,
    reblogs: 419,
    reblog_active: false,
  },
];

Page({
  build() {
    const my_man = new LayoutManager(safeArea);

    hmUI.setLayerScrolling(true);
    hmUI.updateStatusBarTitle("Timeline");

    // req_helper.request("fetchPublicTimeline", data => {
    //   console.log("got data: " + JSON.stringify(data));
    //   for (const post of data) {
    //     (new PostComponent(post)).layout(my_man);
    //     (new SeparatorComponent(10)).layout(my_man);
    //   }
    //   hmUI.createWidget(hmUI.widget.TEXT, {
    //     x: 0,
    //     y: my_man.y,
    //     w: deviceInfo.width,
    //     h: deviceInfo.height / 4,
    //     text: i18n("no_more_posts"),
    //     text_size: 18,
    //     color: 0xAAAAAA,
    //     align_h: hmUI.align.CENTER_H,
    //     align_v: hmUI.align.CENTER_V,
    //   });
    // });

    for (const post of test_posts) {
      (new PostComponent(post)).layout(my_man);
      (new SeparatorComponent(10)).layout(my_man);
      // if (post != test_posts[test_posts.length - 1]) {
      //   (new SeparatorComponent(10)).layout(my_man);
      // }
    }

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: my_man.y,
      w: deviceInfo.width,
      h: deviceInfo.height / 4,
      text: i18n("no_more_posts"),
      text_size: 18,
      color: 0xAAAAAA,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
  }
});
