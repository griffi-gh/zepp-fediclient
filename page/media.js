import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit } from "../utils/navigation";
import LoadingAnimationComponent from "../utils/components/LoadingAnimationComponent";
import InternetImageComponent from '../utils/components/InternetImageComponent.js';

let lifecycle = false;

let image_url;

let loading_component,
    image_component;

Page({
  onInit(param) {
    callMeOnScreenInit();
    lifecycle = true;

    if (param) {
      const { goto_image } = JSON.parse(param);
      if (goto_image) image_url = goto_image;
    }
  },
  build() {
    hmUI.updateStatusBarTitle(i18n("media"));
    hmUI.setLayerScrolling(false);

    loading_component = new LoadingAnimationComponent();
    loading_component.layout({
      x: (safeArea.w - 48) / 2,
      y: (safeArea.h - 48) / 2,
    });

    image_component = new InternetImageComponent(
      image_url,
      safeArea.w,
      safeArea.h,
      "_MEDIA_.png"
    );
    image_component.layout({
      x: safeArea.x,
      y: safeArea.y,
    });

  },
  onDestroy() {
    lifecycle = false;
    if (loading_component) {
      loading_component.delete();
      loading_component = null;
    }
  },
});
