import { tryFetchSomethingAsBinary } from "./fetch.js";
import * as mastodon from "./mastodon.js";
import {
  WESERV_DOMAIN,
  INTERNET_IMAGE_MODE,
  POST_LIMIT_PER_PAGE,
  TGA_USE_RLE,
  POST_MAX_LENGTH,
} from "../configuration.js";
import { MessageBuilder } from "../lib/zepp/message.js";
import createTgaBuffer from "../utils/tga.js";
import jpeg from 'jpeg-js';

const messageBuilder = new MessageBuilder();

function onRequest(ctx, req_data) {
  switch (req_data.request) {
    case "init": {
      console.log("init request");
      ctx.response({
        requestId: ctx.request.traceId,
        data: {
          ready: true,
          instance: mastodon.instance(),
          auth: !!settings.settingsStorage.getItem("access_token"),
          available_timelines: mastodon.DEFAULT_TIMELINES,
        },
      });
      break;
    }

    case "fetchTimeline": {
      const timeline = req_data.timeline ?? mastodon.DEFAULT_TIMELINE;
      const limit = req_data.limit ?? POST_LIMIT_PER_PAGE;
      const maxId = req_data.maxId ?? null;
      const maxPostLen = req_data.maxPostLen ?? POST_MAX_LENGTH;

      console.log(`fetching up to ${limit} posts from "${timeline}" timeline...`);
      if (maxId) console.log("^ also, we got maxId: " + maxId);
      if (maxPostLen) console.log("^ and, we will trim post content to " + maxPostLen + " chars");

      mastodon.fetchTimeline({
        timeline, limit, maxId, maxPostLen
      }).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;
    }

    case "fetchUser": {
      const acct_id = req_data.acct_id;
      const need_user_header = req_data.need_user_header ?? false;
      const need_user_posts = req_data.need_user_posts ?? false;
      const limit = req_data.limit ?? POST_LIMIT_PER_PAGE;
      const maxId = req_data.maxId ?? null;
      const maxPostLen = req_data.maxPostLen ?? POST_MAX_LENGTH;

      console.log("fetching user id " + acct_id);
      if (need_user_header) {
        console.log("^ we need user header");
      }
      if (need_user_posts) {
        console.log("^ we need user posts, up to " + limit);
      }
      if (maxId) {
        console.log("^ and, we got maxId: " + maxId);
      }
      if (maxPostLen) {
        console.log("^ and, we will trim post content to " + maxPostLen + " chars");
      }

      (async () => {
        let header = null;
        if (need_user_header) {
          header = await mastodon.fetchUser(acct_id);
        }

        let posts = null;
        if (need_user_posts) {
          posts = await mastodon.fetchUserPosts({ acct_id, limit, maxId, maxPostLen });
        }

        const res_data = {
          user_header: header,
          user_posts: posts,
        };

        console.log(JSON.stringify(res_data));

        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      })();
      break;
    }

    case "fetchPost": {
      const { id, andDescendants } = req_data;

      console.log("request for post id " + id + " with descendants: " + andDescendants);
      mastodon.fetchPost(id, andDescendants).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;
    }

    case "createPost": {
      const { status } = req_data;

      console.log("posting status: " + status);
      mastodon.createPost(status).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;
    }

    case "image": {
      const { url, width, height, special } = req_data;

      console.log("image request for " + url + " with size " + width + "x" + height);

      const url_encoded = encodeURIComponent(url);
      const desired_format = INTERNET_IMAGE_MODE === "tga" ? "jpg" : "png";
      const contain_cbg = (!!special?.contain) ? (
        special.contain === true ? "black" : special.contain.toString()
      ) : null;
      const url_final =
        `https://${WESERV_DOMAIN}/?url=${url_encoded}&output=${desired_format}&w=${width}&h=${height}`
        + (contain_cbg ? ("&fit=contain&cbg=" + contain_cbg) : "");

      console.log("will go to " + url_final + " to download image");

      tryFetchSomethingAsBinary(url_final).then(src_buf => {
        console.log("image downloaded");

        let buf
        if (INTERNET_IMAGE_MODE === "tga") {
          const rawImageData = jpeg.decode(src_buf, { formatAsRGBA: false });
          console.log("decoded successfully");
          buf = createTgaBuffer(width, height, rawImageData.data, TGA_USE_RLE);
        } else if (INTERNET_IMAGE_MODE === "png") {
          buf = src_buf;
        }

        // ctx.response requires json
        // so use raw sendHmProtocol call instead
        messageBuilder.sendHmProtocol({
          requestId: ctx.request.traceId,
          dataBin: Buffer.from(buf),
          type: 0x2, //"Response"
        });
      });
      break;
    }

    default:
      console.log("unhandled request: " + req_data.request);
  }
}

AppSideService({
  onInit() {
    console.log("app side onInit invoke");

    messageBuilder.listen(() => {});
    messageBuilder.on("request", ctx => {
      const data = messageBuilder.buf2Json(ctx.request.payload);
      onRequest(ctx, data);
    });

    settings.settingsStorage.addListener('change', async ({ key, newValue, oldValue }) => {
      if (key === "_reqest_appid" && newValue === "1") {
        mastodon.createApp();
      } else if (key === "_request_revoke" && newValue === "1") {
        mastodon.revokeToken();
      }
    })
  },
  onRun() {},
  onDestroy() {}
})
