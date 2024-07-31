// App ID
// - If set, MUST match the App ID in app.json
// - Set to "null" to get automatically
//   (which may crash ZeppOS 1.0 devices due to an OS bug)
export const APP_ID = 1059733;

// Deployment target
// "simulator" - for running in the ZeppOS emulator
// "real" - for running on a real device
export const DEPLOYMENT_TYPE = "simulator";

// domain of the mastodon instance to be used by default
// (this is just the default and can be changed in the settings)
export const INSTANCE_DOMAIN = "mastodon.social"; // "woem.men"

// Metadata of the OAuth application
export const CLIENT_META = {
  client_name: "ZeppOSFediClient",
  redirect_uris: {
    "real": "https://zepp-os.zepp.com/app-settings/redirect.html",
    "simulator": "http://zepp-os.zepp.com/app-settings/redirect.html",
  }[DEPLOYMENT_TYPE],
  scopes: "read write follow",
  website: "https://github.com/griffi-gh/zepp-fediclient"
};

// domain of WeServ Image Proxy (wsrv.nl)
// wsrv.nl privacy policy: https://github.com/weserv/images/blob/5.x/Privacy-Policy.md
// wsrv.nl documentation: https://wsrv.nl/docs/introduction.html
// WeServ is not affiliated with FediClient
// To opt out, disable USE_INTERNET_IMAGE or change to a self-hosted instance
export const WESERV_DOMAIN = "wsrv.nl";

// experimental:
// allow use of cached internet images (e.g. for profile pictures);
// may be broken on some real devices, but should always work in the simulator
export const USE_INTERNET_IMAGE = true;

// image format used by image cache;
// always use "png" for simulator, "tga" for real device
export const INTERNET_IMAGE_MODE = {
  simulator: "png",
  real: "tga",
}[DEPLOYMENT_TYPE];

// Use RLE for compressing ALL `InternetImage`s
// experimental, may be broken, use at your own risk
// can actually increase file size in some cases, such as with small images
// raw packets are not implemented, so even single pixels are stored as RLE (2 bytes)
export const TGA_USE_RLE = false;

// Force RLE for compressing media files
// (e.g. large images in post attachments)
// EVEN IF TGA_USE_RLE IS FALSE!
export const MEDIA_FORCE_RLE = true;

// Avoid caching media large media files (e.g. images in post attachments)
// As they are stored in the app's asset directory, they can take up a lot of space
// A terrible hack is required to make this work, so it may be broken
// (recommended: keep as false and clear the cache manually by reinstalling the app every now and then)
export const MEDIA_AVOID_CACHING = false;

// number of posts to fetch per page on the timeline and user post pages
// keep as low as possible to reduce memory usage
// (recommended range: 5-15, depending on the device)
export const POST_LIMIT_PER_PAGE = 5;

// max post length in characters in the timeline and user post pages
// set to "false" to disable the limit (not recommended)
export const POST_MAX_LENGTH = 130;
