export const COMMON_HEADERS = {
  "User-Agent": "ZeppOSFediClient/1.0 (dev; prasol258_at_gmail_dot_com)",
  "X-Client": "ZeppOSFediClient",
};

export function resJson(res) {
  return (
    typeof res.body === 'string' ?
    JSON.parse(res.body) :
    res.body
  );
}

export async function fetchSomething(url, method = 'GET', body = null, auth = true) {
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
export async function tryFetchSomethingAsBinary(url) {
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
