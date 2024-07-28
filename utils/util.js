export const deviceInfo = hmSetting.getDeviceInfo();

//XXX: is the padding wasteful?
//used to be set to 4, but...
//we're already working with an incredibly small screen
//i think a value of like 2 would be more reasonable, but for now
//just disable padding altogether

function getSafeArea(padding = 0) {
  //docs say that titlebar is 64px but it's actually 28?
  const titlebar_height = [28, 0][deviceInfo.screenShape];

  return {
    x0: padding,
    x1: deviceInfo.width - padding,
    y0: padding + titlebar_height,
    y1: deviceInfo.height - padding,
    w: deviceInfo.width - padding * 2,
    h: deviceInfo.height - padding * 2 - titlebar_height,
  }
}

export const safeArea = getSafeArea();

export function textSize(text, text_size, text_width = safeArea.w) {
  return hmUI.getTextLayout(text, {text_size, text_width})
}

export function wrapText(text, text_size, width = safeArea.w) {
  //const words = text.split(/\s/g);
  const words = text.split(' ');

  let wrappedText = "";
  let line = '';

  for (const word of words) {
    const testLine = line + word + ' ';
    const testWidth = hmUI.getTextLayout(testLine, {
      text_size,
      text_width: 0,
      wrapped: 0,
    }).width;

    //console.log(testLine + " " + testWidth);

    if (testWidth >= width) {
      wrappedText += line.trim() + '\n';
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  wrappedText += line.trim();

  return wrappedText;
}
