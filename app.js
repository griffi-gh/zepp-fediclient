import "./lib/zepp/device-polyfill.js";
import { MessageBuilder } from "./lib/zepp/message.js";

App({
  globalData: {
    messageBuilder: null
  },
  onCreate(options) {
    console.log('app on create invoke');

    if (!hmApp.packageInfo) {
      throw new Error('Set appId, appId needs to be the same as the configuration in app.json');
    }
    const appId = hmApp.packageInfo().appId;

    this.globalData.messageBuilder = new MessageBuilder({ appId });
    this.globalData.messageBuilder.connect();
  },
  onDestroy(options) {
    console.log('app on destroy invoke');
    this.globalData.messageBuilder.disConnect();
    this.globalData.messageBuilder = null;
  }
})
