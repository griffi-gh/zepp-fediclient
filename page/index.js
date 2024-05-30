import { gettext as i18n } from 'i18n'

const deviceInfo = hmSetting.getDeviceInfo();

function getSafeArea(padding = 4) {
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

const safeArea = getSafeArea();

function textSize(text, text_size, text_width = safeArea.w) {
  return hmUI.getTextLayout(text, {text_size, text_width: 0})
}

function wrapText(text, text_size, width = safeArea.w) {
  const words = text.split(" "); // /\s/g

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

class LayoutManager {
  constructor(area = safeArea) {
    this.area = area;
    this.x = this.area.x0;
    this.y = this.area.y0;
  }

  account(x, y) {
    this.x += x;
    this.y += y;
  }

  resetX() {
    this.x = safeArea.x0;
  }
}

class PostBody {
  constructor(username, handle, content) {
    this.username = username;
    this.handle = handle;
    this.content = content;
    // this.posted_rel = posted_rel;
  }

  layout(man) {
    const USERNAME_FONT_SIZE = 16;
    const USERNAME_HANDLE_PADDING = -5;
    const HANDLE_FONT_SIZE = 14;
    const USER_CONTENT_PADDING = 0;
    const CONTENT_TEXT_SIZE = 16;

    // Predict size

    // const x0 = man.x;
    // const x1 = man.y;
    // const w = man.area.w;
    // const h = 
    //   USERNAME_FONT_SIZE + 
    //   USERNAME_HANDLE_PADDING +
    //   HANDLE_FONT_SIZE +
    //   USER_CONTENT_PADDING +
    //   CONTENT_TEXT_SIZE;
    
    // USER BLOCK
    
    man.resetX();
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: 32,
      text: this.username,
      text_size: USERNAME_FONT_SIZE,
      color: 0xAAAAAA,
      align_h: hmUI.align.LEFT,
    });
    man.account(
      man.area.w, 
      textSize(this.username, USERNAME_FONT_SIZE).height + 
      USERNAME_HANDLE_PADDING
    );

    man.resetX();
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: 32,
      text: this.handle,
      text_size: HANDLE_FONT_SIZE,
      color: 0xAAAAAA,
      align_h: hmUI.align.LEFT,
    });
    man.account(
      man.area.w, 
      textSize(this.handle, HANDLE_FONT_SIZE).height,
    );
    
    man.resetX();
    man.account(0, USER_CONTENT_PADDING);

    // CONTENT BLOCK
    
    const wt = wrapText(this.content, CONTENT_TEXT_SIZE);
    const sz = textSize(wt, CONTENT_TEXT_SIZE).height;
    man.resetX();
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: man.x,
      y: man.y,
      w: man.area.w,
      h: sz,
      text: wt,
      text_size: CONTENT_TEXT_SIZE,
      color: 0xFFFFFF,
      align_h: hmUI.align.LEFT,
    });
    man.account(man.area.w, sz);
  }
}

class Separator {
  constructor(height, color = 0x444444) {
    this.height = height;
    this.color = color;
  }

  layout(man) {
    man.resetX();
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: man.x,
      y: Math.ceil(man.y + this.height / 2) - 1,
      w: man.area.w,
      h: 2,
      color: this.color,
    });
    man.account(0, this.height);
  }
}


const test_posts = [
  //https://woem.men/notes/9twtytvkvyky021f
  new PostBody(
    "angel with a railgun",
    "@ezri@crimew.gay",
    "they should put the little notification lights back in the phones",
  ),
  //https://woem.men/notes/9twsc9r4vyky01ki
  new PostBody(
    "kaitlin bocchi arc real",
    "@thememesniper@wetdry.world",
    "what happened is that they shipped 1GB of electron and nodejs daemons to control 2 LEDs",
  ),
  //https://woem.men/notes/9iq1x4tk51fo005n
  new PostBody(
    "navi's kitten",
    "@fleckenstein@social.lizzy.rs",
    "My Chromosomes?? What are you talking about I use Firefox",
  )
];

Page({
  build() {
    const my_man = new LayoutManager(safeArea);

    hmUI.updateStatusBarTitle("Timeline");

    for (const post of test_posts) {
      post.layout(my_man);
      if (post != test_posts[test_posts.length - 1]) {
        (new Separator(10)).layout(my_man);
      }
    }

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: my_man.y,
      w: deviceInfo.width,
      h: deviceInfo.height / 4,
      text: i18n("no_more_posts"),
      text_size: 18,
      color: 0xAAAAAA,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
  }
});

