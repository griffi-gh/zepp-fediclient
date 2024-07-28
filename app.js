import "./lib/zepp/device-polyfill.js";
import { MessageBuilder } from "./lib/zepp/message.js";
import { registerBackHandler } from "./utils/navigation.js";

App({
  globalData: {
    messageBuilder: null,
    preserveData: null,
    transitioning: null,
  },
  onCreate(options) {
    console.log('app on create invoke');

    if (!hmApp.packageInfo) {
      throw new Error('Set appId, appId needs to be the same as the configuration in app.json');
    }
    const appId = hmApp.packageInfo().appId;

    this.globalData.messageBuilder = new MessageBuilder({ appId });
    this.globalData.messageBuilder.connect();

    this.globalData.transitioning = false;
    this.globalData.preserveData = {
      data: null,
      stack: [],
    };
    registerBackHandler();

    this.globalData.transitioning = false;
  },
  onDestroy(options) {
    console.log('app on destroy invoke');
    this.globalData.messageBuilder.disConnect();
    this.globalData.messageBuilder = null;
  }
})
