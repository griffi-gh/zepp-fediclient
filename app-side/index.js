import { MessageBuilder } from "../lib/zepp/message.js";
import createTgaBuffer from "../utils/tga.js";
import jpeg from 'jpeg-js';

const messageBuilder = new MessageBuilder();

const DEFAULT_TIMELINE = "local";
const DEFAULT_LIMIT = 15;
//XXX TODO change this to tga for real device!
//    For emulator, set to "png"
const TARGET_FORMAT = "png"; // "tga" or "png"

const COMMON_HEADERS = {
  "User-Agent": "ZeppOSFediClient/1.0 (dev; prasol258_at_gmail_dot_com)",
  "X-Client": "ZeppOSFediClient",
};

//TODO: move to settings
//for now, i just picked a cute random instance :p
const FEDI_DOMAIN = "https://woem.men";

async function fetchSomething(url) {
  console.log("fetch " + url);
  const res = await fetch({
    url,
    method: 'GET',
    headers: {
      "Accept": "application/json",
      ...COMMON_HEADERS,
    }
  });
  const resBody =
    typeof res.body === 'string' ?
    JSON.parse(res.body) :
    res.body;
  return resBody;
}

//This may not work at all
async function tryFetchSomethingAsBinary(url) {
  console.log("fetch " + url);
  const res = await fetch({
    url,
    method: 'GET',
    headers: {
      "Accept": "application/json",
      ...COMMON_HEADERS,
    }
  });
  return res.arrayBuffer();
}


async function fetchTimelineRaw(timeline = DEFAULT_TIMELINE, limit = DEFAULT_LIMIT) {
  const [actual_timeline, query] = {
    "public": ["public", ""],
    "local": ["public", "&local=true"],
    "home": ["home", ""], //requires auth
  }[timeline] ?? [timeline, ""];
  console.log("fetching " + actual_timeline + " timeline... with limit " + limit + " and etc. query " + query);
  return await fetchSomething(`${FEDI_DOMAIN}/api/v1/timelines/${actual_timeline}?limit=${limit}${query}`);
}

function transPost(post) {
  return {
    id: post.id,

    profile_pic: post.account.avatar ?? null,
    username: post.account.display_name ??
              post.account.username ??
              post.account.acct,
    acct: post.account.acct,

    content: post.text ?? post.content ?? null,

    likes: post.favourites_count,
    like_active: post.favourited,
    reblogs: post.reblogs_count,
    reblog_active: post.reblogged,
    replies: post.replies_count,

    reblog: post.reblog ? transPost(post.reblog) : null,
  };
}

async function fetchTimeline(timeline = DEFAULT_TIMELINE, limit = DEFAULT_LIMIT) {
  const posts_raw = await fetchTimelineRaw(timeline, limit);
  console.log(JSON.stringify(posts_raw));
  return posts_raw.map(transPost);
}

function onRequest(ctx, req_data) {
  switch (req_data.request) {
    // case "queryInfo":
    //   console.log("queryInfo request");
    //   ctx.response({
    //     requestId: ctx.request.traceId,
    //     data: {
    //       instance: FEDI_DOMAIN,
    //     },
    //   });
    //   break;

    case "fetchTimeline":
      const timeline = req_data.timeline ?? DEFAULT_TIMELINE;
      const limit = req_data.limit ?? DEFAULT_LIMIT;

      console.log(`fetching up to ${limit} posts from "${timeline}" timeline...`);
      fetchTimeline(timeline).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;

    case "image":
      const { url, width, height } = req_data;

      console.log("image request for " + url + " with size " + width + "x" + height);

      const url_encoded = encodeURIComponent(url);
      const desired_format = TARGET_FORMAT === "tga" ? "jpg" : "png";
      const url_final = `https://wsrv.nl/?url=${url_encoded}&output=${desired_format}&w=${width}&h=${height}`;

      console.log("will go to " + url_final + " to download image");

      tryFetchSomethingAsBinary(url_final).then(src_buf => {
        console.log("image downloaded");

        let buf
        if (TARGET_FORMAT === "tga") {
          const rawImageData = jpeg.decode(src_buf, { formatAsRGBA: false });
          console.log("decoded successfully");
          buf = createTgaBuffer(width, height, rawImageData.data, true);
        } else if (TARGET_FORMAT === "png") {
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
  },
  onRun() {},
  onDestroy() {}
})
