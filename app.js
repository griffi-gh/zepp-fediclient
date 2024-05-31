//import { RequestHelper } from './utils/request_model.js';

App({
  globalData: {
    req_helper: null
  },
  onCreate(options) {
    console.log('app on create invoke');

    // let appId;
    // if (!hmApp.packageInfo) {
    //   throw new Error('Set appId, appId needs to be the same as the configuration in app.json');
    // } else {
    //   appId = hmApp.packageInfo().appId;
    // }

    //this.globalData.req_helper = new RequestHelper();
  },
  onDestroy(options) {
    console.log('app on destroy invoke');
    //hmBle.disConnect();
  }
})
