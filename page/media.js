import { gettext as i18n } from 'i18n';
import { safeArea } from '../utils/util.js';
import { callMeOnScreenInit } from "../utils/navigation";
import LoadingAnimationComponent from "../utils/components/LoadingAnimationComponent";
import InternetImageComponent from '../utils/components/InternetImageComponent.js';
import { MEDIA_AVOID_CACHING, MEDIA_FORCE_RLE } from '../configuration.js';

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
      {
        override_path: MEDIA_AVOID_CACHING ? "_MEDIA_.png" : null,
        allow_overwrite: MEDIA_AVOID_CACHING,
        path_hack: MEDIA_AVOID_CACHING,
        prefix: MEDIA_AVOID_CACHING ? null : "media",
      },
      {
        WSRV_Contain: "black",
        TGA_UseRLE: MEDIA_FORCE_RLE
      },
      () => {
        if (lifecycle && loading_component) {
          loading_component.delete();
          loading_component = null;
        }
      },
    );
    image_component.layout({
      x: safeArea.x0,
      y: safeArea.y0,
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
