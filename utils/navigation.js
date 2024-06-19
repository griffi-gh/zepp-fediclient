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
    case "reload":
      hmApp.reloadPage({
        url: "page/" + page,
        param: JSON.stringify(param)
      });
  }
}

export function gotoTimeline(timeline, max_id = null) {
  goto("timeline", { goto_timeline: timeline, goto_max_id: max_id });
}

export function reloadTimeline(timeline, max_id = null) {
  goto("timeline", { goto_timeline: timeline, goto_max_id: max_id }, "reload");
}

export function gotoPost(post_id) {
  goto("post", { goto_post: post_id });
}
