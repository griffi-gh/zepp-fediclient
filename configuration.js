// domain of the mastodon instance
export const INSTANCE_DOMAIN = "woem.men";

// experimental:
// allow use of cached internet images (e.g. for profile pictures);
// currently broken on real device
export const USE_INTERNET_IMAGE = false;

// image format used by image cache;
// always use "png" for simulator, "tga" for real device
export const INTERNET_IMAGE_MODE = "tga";

// number of posts to fetch per page on the timeline
// keep as low as possible to reduce memory usage
export const POST_LIMIT_PER_PAGE = 5;
