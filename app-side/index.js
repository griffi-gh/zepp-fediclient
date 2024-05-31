import { MessageBuilder } from "../lib/zepp/message.js";

const messageBuilder = new MessageBuilder();

const DEFAULT_TIMELINE = "local";
const DEFAULT_LIMIT = 15;

//TODO: move to settings
//for now, i just picked a cute random instance :p
const FEDI_DOMAIN = "https://woem.men";

async function fetchSomething(url) {
  console.log("fetch " + url);
  const res = await fetch({
    url,
    method: 'GET',
    headers: {
      "User-Agent": "ZeppOSFediClient/1.0 (dev; prasol258_at_gmail_dot_com)",
      "Accept": "application/json",
      "X-Client": "ZeppOSFediClient",
    }
  });
  const resBody =
    typeof res.body === 'string' ?
    JSON.parse(res.body) :
    res.body;
  return resBody;
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

async function fetchTimeline(timeline = DEFAULT_TIMELINE, limit = DEFAULT_LIMIT) {
  const posts_raw = await fetchTimelineRaw(timeline, limit);
  console.log(JSON.stringify(posts_raw));
  const posts = [];
  for (const post of posts_raw) {
    posts.push({
      username: post.account.display_name ?? post.account.username,
      acct: post.account.acct,
      id: post.id,
      content: post.text ?? post.content ?? "",
      likes: post.favourites_count,
      like_active: post.favourited,
      reblogs: post.reblogs_count,
      reblog_active: post.reblogged,
      replies: post.replies_count,
    });
  }
  return posts;
}

function onRequest(ctx, req_data) {
  switch (req_data.request) {
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
