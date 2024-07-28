//THIS CODE IS AWFUL

const KBD_MODES_QW = [
  "12345", "67890", "@#$%:",
  "qwert", "yuiop", "BCK",
  "asdfg", "hjkl",  "ENT",
  "zxcvb", "nm,.!", "DON",
  "SHF",   "SPC",   "",
];
const SPECIAL_KEYS = {
  SHF: true, // shift
  SPC: true, // space
  BCK: true, // backspace
  ENT: true, // enter
  DON: true, // done
}
const KBD_ROW = 3;

const KBD_BUTTON_STYLE = {
  normal_color: 0x222222,
  press_color: 0x666666,
  radius: 8,
}

export default class KeyboardComponent {
  //if preview_area is true, the keyboard will fill the entire screen, and preview_area will be the area above the keyboard
  constructor(cb = () => {}, preview_area = true, keyboard_height = 0.66) {
    this.cb = cb;

    this.keyboard_height = keyboard_height;
    this._preview_area_height = 1 - keyboard_height;

    this.preview_area = preview_area;
    this._preview_widget = null;

    this._key_widget = [];
    this._key_props = [];
    this._shift = false;
    this._currentkey = null;
    this._out = "";
  }

  updpv() {
    if (!this._preview_widget) return;
    this._preview_widget_props.text = this._out + "_";
    this._preview_widget.setProperty(hmUI.prop.MORE, this._preview_widget_props);
  }

  updkys() {
    let use_subchar = 0;
    for (let i = 0; i < KBD_MODES_QW.length; i++) {
      if (SPECIAL_KEYS[KBD_MODES_QW[i]]) continue;

      const wgt = this._key_widget[i];
      const wgt_ikys = this._key_props[i];
      let text;
      if (!this._currentkey) {
        text = this._shift ? KBD_MODES_QW[i].toUpperCase() : KBD_MODES_QW[i];
      } else {
        // HACK: third key is a special case
        if ((use_subchar >= this._currentkey.length) || (i == 2)) {
          text = "";
        } else {
          text = this._currentkey.charAt(use_subchar++);
          if (this._shift) {
            text = text.toUpperCase();
          }
        }
      }

      wgt_ikys.text = text;
      wgt.setProperty(hmUI.prop.MORE, wgt_ikys);
    }
  }

  lick(i) {
    const k = KBD_MODES_QW[i];
    if (SPECIAL_KEYS[k]) {
      if (k == "SHF") {
        this._shift = !this._shift;
        this.updkys();
      } else if (k == "BCK") {
        this._out = this._out.slice(0, -1);
        this.updpv();
      } else if (k == "DON") {
        this.cb(this._out);
      } else if (k == "ENT") {
        this._out += "\n";
        this.updpv();
      } else if (k == "SPC") {
        this._out += " ";
        this.updpv();
      } else {
        throw new Error(`Unknown special key: ${k}`);
      }
    } else if (this._currentkey) {
      // normal key, selected
      this._currentkey = false;
      this._shift = false;
      this._out += this._key_props[i].text;
      this.updkys();
      this.updpv();
    } else {
      // normal key, not selected
      this._currentkey = k;
      this.updkys();
    }
  }

  layout(man) {
    if (this.preview_area) {
      const preview_h = man.area.h * this._preview_area_height;
      this._preview_widget_props = {
        text: this._out + "_",
        x: man.x,
        y: man.y,
        w: man.area.w,
        h: preview_h,
        text_size: 18,
        color: 0xFFFFFF,
      };
      this._preview_widget = hmUI.createWidget(hmUI.widget.TEXT, this._preview_widget_props);
      man.account(0, preview_h);
    }

    const w = man.area.w / KBD_ROW;
    const h = (man.area.h * this.keyboard_height) / (KBD_MODES_QW.length / KBD_ROW);
    for (let i = 0; i < KBD_MODES_QW.length; i++) {
      const x = man.x + Math.floor(i % KBD_ROW) * w;
      const y = man.y + Math.floor(i / KBD_ROW) * h;
      console.log(`x: ${x}, y: ${y}, w: ${w}, h: ${h}`);
      const ikys = {
        x, y, w, h,
        text: KBD_MODES_QW[i],
        ...KBD_BUTTON_STYLE,
        click_func: () => {
          this.lick(i);
        }
      };
      const wgt = hmUI.createWidget(hmUI.widget.BUTTON, ikys);
      this._key_widget.push(wgt);
      this._key_props.push(ikys);
    }
    if (!this._preview_widget) {
      man.account(0, man.area.h * this.keyboard_height);
    }
  }

  delete() {
    this._deleted = true;
    for (const wgt of this._key_widget) {
      hmUI.deleteWidget(wgt);
    }
    this._key_widget = [];
    if (this._preview_widget) {
      hmUI.deleteWidget(this._preview_widget);
      this._preview_widget = null;
    }
  }
}
