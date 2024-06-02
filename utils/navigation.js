export function pushPreserveData() {
  const { preserveData } = getApp()._options.globalData;
  preserveData.stack.push(preserveData.data);
  preserveData.data = null;
}

export function popPreserveData() {
  const { preserveData } = getApp()._options.globalData;
  if (preserveData.stack.length == 0) return;
  preserveData.data = preserveData.stack.pop();
}

export function callMeOnScreenInit() {
  console.log("transitioning done");
  getApp()._options.globalData.transitioning = false;
}

export function registerBackHandler() {
  hmApp.registerGestureEvent(event => {
    if (event == hmApp.gesture.RIGHT) {
      console.log("[GOTO] back");
      if (getApp()._options.globalData.transitioning) {
        console.log("Already transitioning, ignoring event");
        return true;
      } else {
        getApp()._options.globalData.transitioning = true;
        popPreserveData();
        hmApp.goBack();
      }
    }
    return true;
  });
}

export function goto(page, param = {}) {
  if (getApp()._options.globalData.transitioning) {
    console.log("Already transitioning, ignoring event");
    return;
  }
  console.log("[GOTO] " + page, param);
  getApp()._options.globalData.transitioning = true;
  pushPreserveData();
  hmApp.gotoPage({
    url: "page/" + page,
    param: JSON.stringify(param)
  });
}

export function gotoTimeline(timeline) {
  goto("timeline", { goto_timeline: timeline });
}

export function gotoPost(post_id) {
  goto("post", { goto_post: post_id });
}
