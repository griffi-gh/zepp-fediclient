import { fetchSomething, resJson, COMMON_HEADERS } from "./fetch.js";
import {
  CLIENT_META,
  INSTANCE_DOMAIN,
  POST_LIMIT_PER_PAGE,
} from "../configuration";

export const DEFAULT_TIMELINE = "local";
export const DEFAULT_TIMELINES = [
  {
    id: "home",
    name_i18n: "timeline_home",
    auth: true,
  },
  {
    id: "local",
    name_i18n: "timeline_local",
    auth: false,
  },
  {
    id: "public",
    name_i18n: "timeline_public",
    auth: false,
  },
];

export function instance() {
  return settings.settingsStorage.getItem("instance") ?? INSTANCE_DOMAIN;
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
    acct_id: post.account.id,

    content: post.text ?? post.content ?? null,

    likes: post.favourites_count,
    like_active: post.favourited,
    reblogs: post.reblogs_count,
    reblog_active: post.reblogged,
    replies: post.replies_count,

    reblog: post.reblog ? transPost(post.reblog) : null,
  };
}

function transUser(user) {
  return {
    id: user.id,

    profile_pic: user.avatar ?? null,
    username: user.display_name ?? user.username,
    acct: user.acct,

    //TODO: add header (banner) image?

    followers: user.followers_count,
    following: user.following_count,
    posts: user.statuses_count,

    description: user.note,

    //is_bot: user.bot,
  };
}

//Util function to trim post content to given length
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

// Fetch specified timeline
export async function fetchTimeline({
  timeline = DEFAULT_TIMELINE,
  limit = POST_LIMIT_PER_PAGE,
  maxId = null,
  maxPostLen = null,
}) {
  let [actual_timeline, query] = {
    "public": ["public", ""],
    "local": ["public", "&local=true"],
    "home": ["home", ""], //requires auth
  }[timeline] ?? [timeline, ""];

  if (maxId) query += "&max_id=" + maxId;

  console.log("fetching " + actual_timeline + " timeline... with limit " + limit + " and etc. query " + query);
  const posts_raw = await fetchSomething(`https://${instance()}/api/v1/timelines/${actual_timeline}?limit=${limit}${query}`);

  return posts_raw
    .map(transPost)
    .map(post => trimPostLen(post, maxPostLen));
}

export async function fetchUser(acct_id) {
  console.log("fetching user id " + acct_id);

  const user_raw = await fetchSomething(`https://${instance()}/api/v1/accounts/${acct_id}`);
  return transUser(user_raw);
}

//TODO pinned posts? (?pinned=true) and display them first
export async function fetchUserPosts({
  acct_id,
  limit = POST_LIMIT_PER_PAGE,
  maxId = null,
  maxPostLen = null,
}) {
  if (!acct_id) return [];

  let query = "";
  if (maxId) query += "&max_id=" + maxId;

  console.log("fetching posts of user id " + acct_id + " with etc. query " + query);
  const posts_raw = await fetchSomething(`https://${instance()}/api/v1/accounts/${acct_id}/statuses?limit=${limit}${query}`);

  return posts_raw
    .map(transPost)
    .map(post => trimPostLen(post, maxPostLen));
}

// Fetch post with specified id
export async function fetchPost(post_id, andDescendants = false) {
  console.log("fetching post id " + post_id + " with descendants: " + andDescendants);

  const post_status_url = `https://${instance()}/api/v1/statuses/${post_id}`;
  console.log("fetching post from " + post_status_url);
  const post_raw = await fetchSomething(post_status_url);
  console.log("post_raw: " + JSON.stringify(post_raw));
  const post = transPost(post_raw);

  let descendants = null;
  if (andDescendants) {
    const context_url = `https://${instance()}/api/v1/statuses/${post_id}/context`;
    console.log("fetching context from " + context_url);
    const context_raw = await fetchSomething(context_url);
    console.log("context_raw: " + JSON.stringify(context_raw));
    descendants = context_raw.descendants.map(transPost);
    //TODO do sth with ancestors?
  }

  return { post, descendants };
}

// Post stuff on mastodon
export async function createPost(status) {
  console.log("posting status: " + status);
  const data = await fetchSomething(`https://${instance()}/api/v1/statuses`, 'POST', {
    status,
  });
  console.log("post response: " + JSON.stringify(data));
  return {
    id: data.id,
  }
}

export async function createApp() {
  console.log("request for app id");
  const res = resJson(await fetch({
    url: `https://${instance()}/api/v1/apps`,
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
}

export async function revokeToken() {
  console.log("revoking access token");
  const { access_token } = JSON.parse(settings.settingsStorage.getItem("access_token"));
  const { client_id, client_secret } = JSON.parse(settings.settingsStorage.getItem("oauth_app"));
  //This only works on Mastodon, not Sharkey :p
  const res = resJson(await fetch({
    url: `https://${instance()}/oauth/revoke`,
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
