import {
  INSTANCE_DOMAIN,
  INTERNET_IMAGE_MODE,
  POST_LIMIT_PER_PAGE,
  TGA_USE_RLE,
  CLIENT_META,
  POST_MAX_LENGTH,
} from "../configuration.js";
import { MessageBuilder } from "../lib/zepp/message.js";
import createTgaBuffer from "../utils/tga.js";
import jpeg from 'jpeg-js';

const messageBuilder = new MessageBuilder();

const _tmp = settings.settingsStorage.getItem("instance");
const instanceDomain = _tmp ? _tmp : INSTANCE_DOMAIN;

const DEFAULT_TIMELINE = "local";

const COMMON_HEADERS = {
  "User-Agent": "ZeppOSFediClient/1.0 (dev; prasol258_at_gmail_dot_com)",
  "X-Client": "ZeppOSFediClient",
};

function resJson(res) {
  return (
    typeof res.body === 'string' ?
    JSON.parse(res.body) :
    res.body
  );
}

async function fetchSomething(url, method = 'GET', body = null, auth = true) {
  console.log("fetch " + url);

  let auth_header;
  if (auth) {
    let access_token = settings.settingsStorage.getItem("access_token");
    if (access_token) {
      access_token = JSON.parse(access_token);
      auth_header = (access_token.token_type ?? "Bearer") + " " + access_token.access_token;
    }
  }
  console.log("AUTH: " + auth_header);

  const res = await fetch({
    url,
    method: method,
    headers: {
      "Accept": "application/json",
      "Content-Type": body ? "application/json" : undefined,
      "Authorization": auth ? auth_header : undefined,
      ...COMMON_HEADERS,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return resJson(res);
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


//maps Mastodon Status object to our internal post object
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

async function fetchTimeline(timeline = DEFAULT_TIMELINE, limit = POST_LIMIT_PER_PAGE, maxId = null) {
  let [actual_timeline, query] = {
    "public": ["public", ""],
    "local": ["public", "&local=true"],
    "home": ["home", ""], //requires auth
  }[timeline] ?? [timeline, ""];

  if (maxId) query += "&max_id=" + maxId;

  console.log("fetching " + actual_timeline + " timeline... with limit " + limit + " and etc. query " + query);
  const posts_raw = await fetchSomething(`https://${instanceDomain}/api/v1/timelines/${actual_timeline}?limit=${limit}${query}`);
  console.log(JSON.stringify(posts_raw));

  return posts_raw.map(transPost);
}

async function fetchPost(post_id, andDescendants = false) {
  console.log("fetching post id " + post_id + " with descendants: " + andDescendants);


  const post_status_url = `https://${instanceDomain}/api/v1/statuses/${post_id}`;
  console.log("fetching post from " + post_status_url);
  const post_raw = await fetchSomething(post_status_url);
  console.log("post_raw: " + JSON.stringify(post_raw));
  const post = transPost(post_raw);

  let descendants = null;
  if (andDescendants) {
    const context_url = `https://${instanceDomain}/api/v1/statuses/${post_id}/context`;
    console.log("fetching context from " + context_url);
    const context_raw = await fetchSomething(context_url);
    console.log("context_raw: " + JSON.stringify(context_raw));
    descendants = context_raw.descendants.map(transPost);
    //TODO do sth with ancestors?
  }

  return { post, descendants };
}

async function createPost(status) {
  console.log("posting status: " + status);
  const data = await fetchSomething(`https://${instanceDomain}/api/v1/statuses`, 'POST', {
    status,
  });
  console.log("post response: " + JSON.stringify(data));
  return {
    id: data.id,
  }
}

function trimPostLen(post, len) {
  if (!len) return post;
  if (post.content && (post.content.length > len)) {
    post.content = post.content.substring(0, len) + "...";
  }
  if (post.reblog?.content && (post.reblog.content.length > len)) {
    post.reblog.content = post.reblog.content.substring(0, len) + "...";
  }
  return post;
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
      const limit = req_data.limit ?? POST_LIMIT_PER_PAGE;
      const maxId = req_data.maxId ?? null;
      const maxPostLen = req_data.maxPostLen ?? POST_MAX_LENGTH;

      console.log(`fetching up to ${limit} posts from "${timeline}" timeline...`);
      if (maxId) console.log("^ also, we got maxId: " + maxId);
      if (maxPostLen) console.log("^ and, we will trim post content to " + maxPostLen + " chars");

      fetchTimeline(timeline, limit, maxId).then(res_data => {
        if (maxPostLen) {
          res_data = res_data.map(post => trimPostLen(post, maxPostLen));
        }
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;

    case "fetchPost":
      const { id, andDescendants } = req_data;

      console.log("request for post id " + id + " with descendants: " + andDescendants);

      fetchPost(id, andDescendants).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      break;

    case "createPost":
      const { status } = req_data;
      console.log("posting status: " + status);
      createPost(status).then(res_data => {
        console.log("Done (trace request id: " + ctx.request.traceId + ")");
        console.log(JSON.stringify(res_data));
        ctx.response({
          requestId: ctx.request.traceId,
          data: res_data,
        });
      });
      // ctx.response({
      //   requestId: ctx.request.traceId,
      //   data: { id: "bogus" },
      // });
      break;

    case "image":
      const { url, width, height } = req_data;

      console.log("image request for " + url + " with size " + width + "x" + height);

      const url_encoded = encodeURIComponent(url);
      const desired_format = INTERNET_IMAGE_MODE === "tga" ? "jpg" : "png";
      const url_final = `https://wsrv.nl/?url=${url_encoded}&output=${desired_format}&w=${width}&h=${height}`;

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
        console.log("request for app id");
        const res = resJson(await fetch({
          url: `https://${instanceDomain}/api/v1/apps`,
          method: 'POST',
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...COMMON_HEADERS,
          },
          body: JSON.stringify(CLIENT_META),
        }));
        console.log("app response: " + JSON.stringify(res));
        settings.settingsStorage.setItem("oauth_app", JSON.stringify(res));
      } else if (key === "_request_revoke" && newValue === "1") {
        console.log("revoking access token");
        const { access_token } = JSON.parse(settings.settingsStorage.getItem("access_token"));
        const { client_id, client_secret } = JSON.parse(settings.settingsStorage.getItem("oauth_app"));
        //This only works on Mastodon, not Sharkey :p
        const res = resJson(await fetch({
          url: `https://${instanceDomain}/oauth/revoke`,
          method: 'POST',
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...COMMON_HEADERS,
          },
          body: JSON.stringify({
            client_id,
            client_secret,
            token: access_token,
          }),
        }));
        console.log("revoke response: " + JSON.stringify(res));
        settings.settingsStorage.removeItem("access_token");
      }
    })
  },
  onRun() {},
  onDestroy() {}
})
