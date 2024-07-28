// Deployment target
// "simulator" - for running in the ZeppOS emulator
// "real" - for running on a real device
export const DEPLOYMENT_TYPE = "simulator";

// domain of the mastodon instance to be used by default
// (this is just the default and can be changed in the settings)
export const INSTANCE_DOMAIN = "woem.men";

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

// Use RLE for compressing `InternetImage`s
// experimental, may be broken
export const TGA_USE_RLE = false;

// number of posts to fetch per page on the timeline
// keep as low as possible to reduce memory usage
export const POST_LIMIT_PER_PAGE = 5;
