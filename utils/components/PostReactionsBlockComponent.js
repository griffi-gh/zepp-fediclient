import {
  default as ReactionComponent,
  DEFAULT_REACT_COLOR_INACTIVE,
} from "./ReactionComponent.js";

export default class PostReactionsBlockComponent {
  constructor(
    like_count = 0,
    like_active = false,
    reblog_count = 0,
    reblog_active = false,
    reply_count = 0,
  ) {
    this.like_count_component = new ReactionComponent(
      like_count, like_active,
      "heart.png", "heart-active.png",
      DEFAULT_REACT_COLOR_INACTIVE, 0xee1111,
    );
    this.reblog_count_component = new ReactionComponent(
      reblog_count, reblog_active,
      "reblog.png", "reblog-active.png",
      DEFAULT_REACT_COLOR_INACTIVE, 0x22bb22,
    );
    this.reply_count_component = new ReactionComponent(
      reply_count, false,
      "reply.png", null,
      DEFAULT_REACT_COLOR_INACTIVE, null,
    );
  }

  layout(man) {
    man.x = man.area.x0;
    this.like_count_component.layout(man);
    man.x = Math.max(man.x, man.area.x0 + man.area.w * 0.33);
    this.reblog_count_component.layout(man);
    man.x = Math.max(man.x, man.area.x0 + man.area.w * 0.66);
    this.reply_count_component.layout(man);
    //HACK only takes height from like count component into account
    this.like_count_component.endl(man);
  }

  delete() {
    this._deleted = true;
    this.like_count_component.delete();
    this.reblog_count_component.delete();
    this.reply_count_component.delete();
  }
}
