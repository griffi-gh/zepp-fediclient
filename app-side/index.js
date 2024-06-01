import { MessageBuilder } from "../lib/zepp/message.js";
import { CanvasTGA } from "../lib/mmk/CanvasTGA-SERVERSIDE.js";
import jpeg from 'jpeg-js';

const messageBuilder = new MessageBuilder();

const DEFAULT_TIMELINE = "local";
const DEFAULT_LIMIT = 15;

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
      const filter_empty = !!req_data.filter_empty; // experimental

      console.log(`fetching up to ${limit} posts from "${timeline}" timeline ${filter_empty ? "with" : "without"} filtering...`);

      fetchTimeline(timeline).then(res_data => {
        if (filter_empty) {
          res_data = res_data.filter(post => post.content.length > 0);
        }
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

      //TODO if width/height is not provided, skip resizing
      //TODO if width/height is provided, but is the same as original, skip resizing

      console.log("image request for " + url + " with size " + width + "x" + height);

      const url_final = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=jpg&w=${width}&h=${height}`;

      console.log("will go to " + url_final + " to download image");

      tryFetchSomethingAsBinary(url_final).then(buf => {
        console.log("image downloaded");

        const rawImageData = jpeg.decode(buf, { formatAsRGBA: false });
        console.log("decoded successfully");

        // const data_tga = createTgaBuffer(width, height, rawImageData.data, true);
        // console.log("tga created successfully");
        const canvas = new CanvasTGA(width, height);

        //first, generate palette
        // const SHIFTS = 4;

        // const palette_set = new Set();
        // for (let idx = 0; idx < height * width; idx++) {
        //   let base = idx * 3;
        //   const r = rawImageData.data[base] >> SHIFTS;
        //   const g = rawImageData.data[base + 1] >> SHIFTS;
        //   const b = rawImageData.data[base + 2] >> SHIFTS;
        //   const rgb_hex = (r << 16) | (g << 8) | b;
        //   palette_set.add(rgb_hex);
        // }
        // console.log("palette set created successfully, size: " + palette_set.size);

        const palette_map = {
          "white": 0xffffff,
          "black": 0x0,
        };
        // for (const color of palette_set) {
        //   const color_str = color.toString(16).padStart(6, "0");
        //   palette_map[color_str] = color;
        // }
        canvas.addPalette(palette_map);

        console.log("palette added successfully");
        console.log(JSON.stringify(palette_map));

        // for (let idx = 0; idx < height * width; idx++) {
        //   let base = idx * 3;
        //   const r = rawImageData.data[base];
        //   const g = rawImageData.data[base + 1];
        //   const b = rawImageData.data[base + 2];
        //   const color_hex = ((r >> SHIFTS) << 16) | ((g >> SHIFTS) << 8) | (b >> SHIFTS);
        //   canvas.fillStyle = color_hex.toString(16).padStart(6, "0");
        //   const x = idx % width;
        //   const y = Math.floor(idx / width);
        //   canvas.fillRect(x, y, 1, 1);
        // }
        canvas.fillStyle = "white";
        canvas.fillRect(0, 0, 32, 32);

        console.log("buffer length: " + canvas.data.length);
        console.log(JSON.stringify(canvas.data.slice(0, 16)));

        // const data_tga_base64 = canvas.data.toString("base64");
        // console.log("tga base64 created successfully");

        // ctx.response requires json
        // drop down to sendHmProtocol for binary
        messageBuilder.sendHmProtocol({
          requestId: ctx.request.traceId,
          dataBin: Buffer.from(canvas.data.buffer),
          type: 0x2, //Response
        });
      });

      // //XXX: HOPEFULLY this will work even with 1.0 api
      // //It was added in 3.0 but... not sure if limitations also apply to side services
      // const downloadTask = network.downloader.downloadFile({
      //   url,
      //   timeout: 60000
      // });

      // //TODO handle failure
      // downloadTask.onSuccess = event => {
      //   const file_path = event.tempFilePath ?? event.filePath;
      //   console.log("downloaded to " + file_path);
      //   const file_buf = fs.readFileSync(file_path);
      //   ctx.response({
      //     requestId: ctx.request.traceId,
      //     data: {

      //     }
      //   });
      // };
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
