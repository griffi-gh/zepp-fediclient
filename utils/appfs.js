let _app_dir;

function getAppDirSegments() {
  if (_app_dir) return _app_dir;

  let appTags;
  try {
    const [id, type] = appContext._options.globalData.appTags;
    appTags = [id, type];
  } catch(_) {
    const packageInfo = hmApp.packageInfo();
    appTags = [packageInfo.appId, packageInfo.type];
  }
  const [id, type] = appTags;

  const base = `js_${type}s`;
  const idn = id.toString(16).padStart(8, "0").toUpperCase();
  _app_dir = [base, idn];

  return _app_dir;
}

export function getAppDataPath(path = "/") {
  if(path[0] != "/") path = "/" + path;
  const [base, idn] = getAppDirSegments();
  return `/storage/${base}/data/${idn}${path}`;
}

export function getAppAssetsPath(path = "/") {
  if(path[0] != "/") path = "/" + path;
  const [base, idn] = getAppDirSegments();
  return `/storage/${base}/${idn}/assets${path}`;
}
