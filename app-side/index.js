// //import { Buffer } from '../shared/shared.js';

// //TODO: move to settings
// //for now, i just picked a cute random instance :p
// const FEDI_DOMAIN = "https://woem.men";

// async function fetchSomething(url) {
//   const res = await fetch({
//     url,
//     method: 'GET',
//     headers: {
//       "User-Agent": "ZeppOSFediClient/1",
//       "Accept": "application/json",
//     }
//   });
//   const resBody =
//     typeof res.body === 'string' ?
//     JSON.parse(res.body) :
//     res.body;
//   return resBody;
// }

// async function fetchPublicTimelineRaw(limit = 5) {
//   return await fetchSomething(`${FEDI_DOMAIN}/api/v1/timelines/public?limit=${limit}`);
// }

// async function fetchPublicTimeline(limit = 5) {
//   const timeline = await fetchPublicTimelineRaw(limit);
//   const posts = [];
//   for (const post of timeline) {
//     posts.push({
//       username: post.account.display_name ?? post.account.username,
//       acct: post.account.acct,
//       id: post.id,
//       content: post.text ?? post.content ?? "",
//       likes: post.favourites_count,
//       like_active: post.favourited,
//       reblogs: post.reblogs_count,
//       reblog_active: post.reblogged,
//       replies: post.replies_count,
//     });
//   }
// }

// AppSideService({
//   onInit() {
//     console.log("app side onInit invoke")
//     messaging.peerSocket.addListener('message', payload => {
//       const message = JSON.parse(Buffer.from(payload).toString('utf-8'))
//       console.log("msg: " + JSON.stringify(message));
//       switch (message.request) {
//         case "fetchPublicTimeline":
//           //TODO handle errors, (send them back to the watch?)
//           fetchPublicTimeline().then(data => {
//             messaging.peerSocket.send(Buffer.from(JSON.stringify({
//               response: message.request,
//               data
//             })));
//           });
//           break;
//       }
//     });
//   },
//   onRun() {},
//   onDestroy() {}
// })
