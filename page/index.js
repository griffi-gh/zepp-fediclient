import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { gotoTimeline } from '../utils/navigation.js';

const BUTTON_STYLE = {
  normal_color: 0x333333,
  press_color: 0x666666,
  radius: 8,
}

Page({
  build() {
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
