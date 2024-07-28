import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { gotoTimeline, callMeOnScreenInit, goto } from '../utils/navigation.js';

const BUTTON_STYLE = {
  normal_color: 0x333333,
  press_color: 0x666666,
  radius: 8,
}

Page({
  onInit(param) {
    callMeOnScreenInit();
  },
  build() {
    // {
    //   const man = new LayoutManager();
    //   const img = new InternetImageComponent("https://woem.men/files/780c2764-fb28-4d80-91b0-cd8008b5ebc9", 32, 32);
    //   img.layout(man);
    // }

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

    for (const timeline of ["local", "public", "home"]) {
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: safeArea.x0,
        y: yy,
        w: safeArea.w,
        h: 40,
        text: i18n("timeline_" + timeline),
        click_func: () => gotoTimeline(timeline),
        ...BUTTON_STYLE,
      });
      yy += 40 + 4;
    }

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: safeArea.x0,
      y: safeArea.y1 - 40,
      w: safeArea.w,
      h: 40,
      text: i18n("page_write"),
      click_func: () => goto("write"),
      ...BUTTON_STYLE,
    });
  },
})
