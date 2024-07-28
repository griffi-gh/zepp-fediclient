import { gettext as i18n } from 'i18n';
import { handleError, safeArea } from '../utils/util.js';
import { LayoutManager } from '../utils/layout.js';
import { callMeOnScreenInit, gotoPost } from '../utils/navigation.js';
import KeyboardComponent from '../utils/components/KeyboardComponent.js';
import LoadingAnimationComponent from '../utils/components/LoadingAnimationComponent.js';

//import NoMorePostsLoadedComponent from '../utils/components/NoMorePostsLoadedComponent.js';

const { messageBuilder } = getApp()._options.globalData;

let keyboard_component,
    loading_component;

let lifecycle = false;

function on_text_submitted(text) {
  if (!lifecycle) return;
  console.log("create post: " + text);

  // keyboard_component.delete();
  // keyboard_component = null;

  loading_component = new LoadingAnimationComponent();
  loading_component.layout({
    x: (safeArea.w - 48) / 2,
    y: (safeArea.h - 48) / 2,
  });

  console.log("send request...");
  messageBuilder.request({
    request: "createPost",
    status: text,
  }).then(res => {
    console.log("post created: " + res.id);
    if (!lifecycle) return;
    gotoPost(res.id);
  });
}

try {
  Page({
    onInit(param) {
      callMeOnScreenInit();
      lifecycle = true;
      // TODO param: reply_to
    },
    build() {
      hmUI.updateStatusBarTitle(i18n("page_write")); //IF REPLY: i18n("write_reply")
      hmUI.setLayerScrolling(false);

      const man = new LayoutManager(safeArea);
      keyboard_component = new KeyboardComponent(on_text_submitted, true);
      keyboard_component.layout(man);
    },
    onDestroy() {
      lifecycle = false;
      // if (keyboard_component) keyboard_component.delete();
      if (loading_component) loading_component.delete();
    }
  });
} catch (err) {
  handleError(err);
}
