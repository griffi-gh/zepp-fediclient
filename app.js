import "./lib/zepp/device-polyfill.js";
import { MessageBuilder } from "./lib/zepp/message.js";
import { registerBackHandler } from "./utils/navigation.js";
import { APP_ID } from "./configuration.js";

App({
  globalData: {
    messageBuilder: null,
    preserveData: null,
    transitioning: null,
  },
  onCreate(options) {
    console.log('app on create invoke');

    // Get App ID
    let appId;
    if (APP_ID != null) {
      appId = APP_ID;
    } else {
      if (!hmApp.packageInfo) {
        throw new Error('Set appId, appId needs to be the same as the configuration in app.json');
      }
      console.log("calling packageinfo, may crash..");
      appId = hmApp.packageInfo().appId;
    }
    console.log("app id: " + appId);

    this.globalData.messageBuilder = new MessageBuilder({ appId });
    this.globalData.messageBuilder.connect();

    // Set up navigation handler
    this.globalData.transitioning = false;
    // this.globalData.preserveData = {
    //   data: null,
    //   stack: [],
    // };
    registerBackHandler();

    // Keep screen on (600 = 20 minutes)
    hmSetting.setBrightScreen(1200);

    console.log("uwu init");
  },
  onDestroy(options) {
    console.log('app on destroy invoke');

    // Disconnect messageBuilder
    this.globalData.messageBuilder.disConnect();

    // Destroy global data
    this.globalData.messageBuilder = null;
    this.globalData.preserveData = null;
    this.globalData.transitioning = null;

    // Cancel setBrightScreen
    hmSetting.setBrightScreenCancel();

    console.log("owo deinit");
  }
})
