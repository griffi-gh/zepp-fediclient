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

export function registerBackHandler() {
  hmApp.registerGestureEvent(event => {
    if (event == hmApp.gesture.RIGHT) {
      console.log("[GOTO] back");
      getApp()._options.globalData.goingBack = true;
      popPreserveData();
      hmApp.goBack();
    }
    return true;
  });
}

export function goto(page, param = {}) {
  console.log("[GOTO] " + page, param);
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
