// import { getAppDataPath } from "./appfs.js";
import { cyrb53 } from "./hash.js";
import requestBin from "./request_bin.js";

const { messageBuilder } = getApp()._options.globalData;

export function getCachedImagePath(url, width = 0, height = 0) {
  const hashed_url = cyrb53(url).toString(16);
  return `_img_${hashed_url}_${width}x${height}.png`;
  // return getAppDataPath(`${hashed_url}_${width}x${height}.png`);
}

const inProgressReqests = new Map();

// WARN: override_path disables the cache
export function ensureImageCached(
  url,
  callback = _ => {},
  width = null,
  height = null,
  override_path = null,
  special = null,
) {
  const path = override_path ?? getCachedImagePath(url, width, height);

  // already requested? add callback to the list
  if (inProgressReqests.has(url)) {
    console.log("already requested, adding callback to the list")
    inProgressReqests.get(url).push(callback);
    return;
  }

  if (!override_path) {
    //file exists? resolve immediately
    const [_, err] = hmFS.stat_asset(path);
    if (err === 0) {
      console.log("file exists, resolving immediately")
      callback(path);
      return;
    }
  }

  //doesn't exist? request it over ble
  //it will be converted to tga and resized on the side service
  //so we don't need to worry about it
  inProgressReqests.set(url, [callback]);
  requestBin(messageBuilder,
    {
      request: "image",
      url, width, height, special,
    })
    .then(src_buf => {
      console.log("image downloaded");

      const buf = new Uint8Array(src_buf);

      // console.log("buf len " + buf.length);
      // console.log(JSON.stringify(buf.slice(0, 16)));

      const fileId = hmFS.open_asset(path, hmFS.O_WRONLY | hmFS.O_CREAT | hmFS.O_EXCL);
      hmFS.write(fileId, buf.buffer, 0, buf.length)
      hmFS.close(fileId);

      console.log("written, resolving");

      const resolv = inProgressReqests.get(url);
      for (const cb of resolv) {
        cb(path);
      }
      inProgressReqests.delete(url);
    });
}
