import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit, gotoFeed, gotoWrite, gotoMedia } from '../utils/navigation.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';

const { messageBuilder } = getApp()._options.globalData;

const ACTIVITIES = [
  {
    feed: {
      type: "timeline",
      timeline: "home",
    },
    name_i18n: "timeline_home",
    auth: true,
  },
  {
    feed: {
      type: "timeline",
      timeline: "local",
    },
    name_i18n: "timeline_local",
    auth: false,
  },
  {
    feed: {
      type: "timeline",
      timeline: "public",
    },
    name_i18n: "timeline_public",
    auth: false,
  },
  // {
  //   feed: {
  //     type: "bookmarks",
  //   },
  //   name_i18n: "bookmarks",
  //   auth: true,
  // },
];

let lifecycle = false,
    loading_component = null,
    _destroy = [];

// Show the main screen with buttons to navigate to different timelines
function buildUiReady(ctx) {
  let yy = safeArea.y0;

  hmUI.updateStatusBarTitle(ctx.instance);

  const BUTTON_STYLE = {
    normal_color: 0x333333,
    press_color: 0x666666,
    color: 0xffffff,
    radius: 8,
  };

  const BUTTON_STYLE_DISABLED = {
    normal_color: 0x202020,
    press_color: 0x202020,
    color: 0x808080,
    radius: 8,
  };

  _destroy.push(hmUI.createWidget(hmUI.widget.TEXT, {
    x: safeArea.x0,
    y: yy,
    w: safeArea.w,
    h: 32,
    text: i18n("timeline_title"),
    text_size: 24,
    align_h: hmUI.align.CENTER_H,
    color: 0xffffff,
  }));
  yy += 32 + 4;

  for (const activity of ACTIVITIES) {
    const activity_actually_available = (!activity.auth) || ctx.auth;
    const btn = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: safeArea.x0,
      y: yy,
      w: safeArea.w,
      h: 40,
      text: i18n(activity.name_i18n),
      click_func: () => {
        if (activity_actually_available) {
          gotoFeed(activity.feed);
        }
      },
      ...(activity_actually_available ? BUTTON_STYLE: BUTTON_STYLE_DISABLED),
    });
    if (!activity_actually_available) {
      btn.setEnable(false);
    }
    _destroy.push(btn);
    yy += 40 + 4;
  }

  //DEBUG
  // _destroy.push(hmUI.createWidget(hmUI.widget.BUTTON, {
  //   x: safeArea.x0,
  //   y: safeArea.y1 - 90,
  //   w: safeArea.w,
  //   h: 40,
  //   text: "[DEBUG] " + i18n("media"),
  //   click_func: () => gotoMedia("https://woem.men/proxy/static.webp?url=https%3A%2F%2Fmedia.void.rehab%2Fnull%2Fwebpublic-4ace6aac-7527-46f6-88b9-31c4e0aaff11.webp&static=1"),
  //   ...BUTTON_STYLE,
  // }));
  // _destroy.push(hmUI.createWidget(hmUI.widget.BUTTON, {
  //   x: safeArea.x0,
  //   y: safeArea.y1 - 180,
  //   w: safeArea.w,
  //   h: 40,
  //   text: "[DEBUG] " + i18n("media"),
  //   click_func: () => gotoMedia("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1920px-Google_2015_logo.svg.png"),
  //   ...BUTTON_STYLE,
  // }));

  _destroy.push(hmUI.createWidget(hmUI.widget.BUTTON, {
    x: safeArea.x0,
    y: safeArea.y1 - 40,
    w: safeArea.w,
    h: 40,
    text: i18n("page_write"),
    click_func: () => gotoWrite(),
    ...BUTTON_STYLE,
  }));
}

function buildUiSetupReqired(ctx) {
  // Show screen telling the user to setup the app in zepp

  // The alignment here is kinda hacky but whatever

  _destroy.push(hmUI.createWidget(hmUI.widget.TEXT, {
    x: safeArea.x0,
    y: safeArea.y0,
    w: safeArea.w,
    h: safeArea.h * 0.75,
    text: i18n("setup_required"),
    text_size: 24,
    text_style: hmUI.text_style.ELLIPSIS,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    color: 0xffffff,
  }));

  _destroy.push(hmUI.createWidget(hmUI.widget.TEXT, {
    x: safeArea.x0,
    y: safeArea.y0 + (safeArea.h * 0.25),
    w: safeArea.w,
    h: safeArea.h * 0.75,
    text: i18n("setup_required_etc"),
    text_size: 18,
    text_style: hmUI.text_style.ELLIPSIS,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    color: 0xffffff,
  }));
}

Page({
  onInit(param) {
    callMeOnScreenInit();
    lifecycle = true;
  },
  build() {
    _destroy = [];

    hmUI.updateStatusBarTitle(i18n("app_name"));
    hmUI.setLayerScrolling(false);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    console.log("getting init data");
    messageBuilder
      .request({ request: "init" })
      .then(res => {
        if (!lifecycle) return;
        if (loading_component) {
          loading_component.delete();
          loading_component = null;
        }
        if (res.ready) {
          buildUiReady(res);
        } else {
          buildUiSetupReqired(res);
        }
      });
  },
  onDestroy() {
    lifecycle = false;
    for (const d of _destroy) {
      hmUI.deleteWidget(d);
    }
    _destroy = [];
    if (loading_component) {
      loading_component.delete();
      loading_component = null;
    }
  },
})
