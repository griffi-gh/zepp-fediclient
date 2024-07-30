import { safeArea } from "./../utils/util.js";

export class LayoutManager {
  constructor(area = safeArea) {
    this.area = area;
    this.x = this.area.x0;
    this.y = this.area.y0;
    this.resetStack = [
      [this.area.x0, this.area.y0],
    ];
  }

  account(x, y) {
    this.x += x;
    this.y += y;
  }

  resetX() {
    this.x = this.resetStack[this.resetStack.length - 1][0];
  }

  resetY() {
    this.y = this.resetStack[this.resetStack.length - 1][1];
  }

  resetXY() {
    this.resetX();
    this.resetY();
  }

  pushReset(x = this.x, y = this.y) {
    this.resetStack.push([x, y]);
  }

  popReset() {
    this.resetStack.pop();
  }
}

export class CleanupHelper {
  constructor() {
    this._widgets = [];
    this._components = [];
    this._attachments = []; // for example, FullClickHelper
  }

  addWidget(widget) {
    this._widgets.push(widget);
  }

  addComponent(component) {
    this._components.push(component);
  }

  addAttachment(attachment) {
    this._attachments.push(attachment);
  }

  delete() {
    for (const attachment of this._attachments) {
      attachment.detach();
    }
    this._attachments = [];

    for (const widget of this._widgets) {
      hmUI.deleteWidget(widget);
    }
    this._widgets = [];

    for (const component of this._components) {
      component.delete();
    }
    this._components = [];
  }
}
