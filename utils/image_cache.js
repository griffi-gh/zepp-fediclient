// import { getAppDataPath } from "./appfs.js";
import { cyrb53 } from "./hash.js";
import requestBin from "./request_bin.js";

const { messageBuilder } = getApp()._options.globalData;

const DEFAULT_PREFIX = "img";

export function getCachedImagePath(url, width = 0, height = 0, prefix = DEFAULT_PREFIX) {
  const hashed_url = cyrb53(url).toString(16);
  return `_CACHE_${prefix}_${hashed_url}_${width}x${height}.png`;
  // return getAppDataPath(`${hashed_url}_${width}x${height}.png`);
}

const inProgressReqests = new Map();

// WARN: override_path disables the cache
export function ensureImageCached(
  url,
  callback = _ => {},
  width = null,
  height = null,
  client_param = {},
  server_param = null,
) {
  //console.log(`ensureImageCached(${url}, ${width}, ${height}, ${JSON.stringify(client_param)}, ${JSON.stringify(server_param)})`);

  const path = client_param.override_path ?? getCachedImagePath(
    url, width, height,
    client_param.prefix ?? DEFAULT_PREFIX
  );

  // path hack is a way to avoid the ZeppOS RAM cache
  let image_view_path = path;
  if (client_param.path_hack) {
    let path_hack = ("/").repeat(Math.floor(Math.random() * 256));
    image_view_path = path_hack + image_view_path;
  }

  // already requested? add callback to the list
  if (inProgressReqests.has(url)) {
    console.log("already requested, adding callback to the list")
    inProgressReqests.get(url).push(callback);
    return;
  }

  if (!client_param.override_path) {
    //file exists? resolve immediately
    const [_, err] = hmFS.stat_asset(path);
    if (err === 0) {
      console.log("file exists, resolving immediately")
      callback(image_view_path);
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
      url, width, height,
      special: server_param,
    })
    .then(src_buf => {
      console.log("image downloaded");

      const buf = new Uint8Array(src_buf);

      const flags = client_param.allow_overwrite ?
        (hmFS.O_WRONLY | hmFS.O_CREAT | hmFS.O_TRUNC) :
        (hmFS.O_WRONLY | hmFS.O_CREAT | hmFS.O_EXCL);
      const fileId = hmFS.open_asset(path, flags);
      hmFS.write(fileId, buf.buffer, 0, buf.length)
      hmFS.close(fileId);

      console.log("written, resolving");

      const resolv = inProgressReqests.get(url);
      for (const resolv_callback of resolv) {
        resolv_callback(image_view_path);
      }
      inProgressReqests.delete(url);
    });
}
