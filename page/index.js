import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { ensureImageCached } from '../utils/image_cache.js';

const BUTTON_STYLE = {
  normal_color: 0x333333,
  press_color: 0x666666,
  radius: 8,
}

function gotoTimeline(timeline) {
  hmApp.gotoPage({
    url: "page/timeline",
    param: JSON.stringify({
      goto_timeline: timeline,
    }),
  });
}

Page({
  build() {
    ensureImageCached(
      `https://woem.men/proxy/avatar.webp?url=https%3A%2F%2Fmisskey-taube.s3.eu-central-1.wasabisys.com%2Ffiles%2F50998b96-a57a-44df-a0a5-650fc9bf9a88.png&avatar=1`,
      32, 32,
      (pth) => {
        console.log("got this: " + pth)
        hmUI.createWidget(hmUI.widget.IMG, {
          src: pth,
          x: safeArea.x0,
          y: safeArea.y0,
          w: 32,
          h: 32,
        });
      }
    );

    let yy = safeArea.y0;

    hmUI.updateStatusBarTitle(i18n("app_name"));
    hmUI.setLayerScrolling(false);

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: safeArea.x0,
      y: yy,
      w: safeArea.w,
      h: 32,
      text: i18n("timeline_title"),
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      color: 0xffffff,
    });
    yy += 32 + 4;

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: safeArea.x0,
      y: yy,
      w: safeArea.w,
      h: 40,
      text: i18n("timeline_local"),
      click_func: () => gotoTimeline("local"),
      ...BUTTON_STYLE,
    });
    yy += 40 + 4;

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: safeArea.x0,
      y: yy,
      w: safeArea.w,
      h: 40,
      text: i18n("timeline_public"),
      click_func: () => gotoTimeline("public"),
      ...BUTTON_STYLE,
    });
    yy += 40 + 4;

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: safeArea.x0,
      y: yy,
      w: safeArea.w,
      h: 40,
      text: i18n("timeline_home"),
      click_func: () => gotoTimeline("home"),
      ...BUTTON_STYLE,
    });
    yy += 40 + 4;
  },
});
