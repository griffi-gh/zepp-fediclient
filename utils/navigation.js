export function pushPreserveData() {
  // const { preserveData } = getApp()._options.globalData;
  // preserveData.stack.push(preserveData.data ?? null);
  // preserveData.data = null;
}

export function popPreserveData() {
  // const { preserveData } = getApp()._options.globalData;
  // if (preserveData.stack.length == 0) {
  //   preserveData.data = null;
  //   return;
  // }
  // preserveData.data = preserveData.stack.pop();
}

export function callMeOnScreenInit() {
  console.log("transitioning done");
  getApp()._options.globalData.transitioning = false;
  hmUI.setStatusBarVisible(true);
}

let safety = 0;
export function registerBackHandler() {
  hmApp.registerGestureEvent(event => {
    if (event == hmApp.gesture.RIGHT) {
      console.log("[GOTO] back");
      if (getApp()._options.globalData.transitioning) {
        console.log("Already transitioning, ignoring event");
        safety++;
        if (safety > 10) {
          safety = 0;
          console.log("safety trigger, exiting app");
          hmApp.exit();
        }
        return true;
      } else {
        getApp()._options.globalData.transitioning = true;
        popPreserveData();
        // hmApp.goBack();
        safety = 0;
        return false; // actually go back
      }
    }
    return true;
  });
}

export function goto(page, param = {}, action = "goto") {
  if (getApp()._options.globalData.transitioning) {
    console.log("Already transitioning, ignoring event");
    return;
  }
  console.log("[GOTO] " + page, param);
  getApp()._options.globalData.transitioning = true;
  //XXX: should reload pushPreserveData() here?
  switch (action) {
    case "goto":
      pushPreserveData();
      hmApp.gotoPage({
        url: "page/" + page,
        param: JSON.stringify(param)
      });
      break;
    case "reload":
      hmApp.reloadPage({
        url: "page/" + page,
        param: JSON.stringify(param)
      });
      break;
    default:
      throw new Error("Unknown action: " + action);
  }
}

export function gotoTimeline(timeline, max_id = null, page_idx = null) {
  goto("timeline", {
    goto_timeline: timeline,
    goto_max_id: max_id,
    goto_page_idx: page_idx,
  });
}

export function reloadTimeline(timeline, max_id = null, page_idx = null) {
  goto("timeline", {
    goto_timeline: timeline,
    goto_max_id: max_id,
    goto_page_idx: page_idx,
  }, "reload");
}

export function gotoPost(post_id) {
  goto("post", { goto_post: post_id });
}

export function gotoUser(acct_id) {
  goto("user", { goto_acct_id: acct_id });
}

export function gotoMedia(image_url) {
  goto("media", { goto_image: image_url });
}
