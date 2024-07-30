import PostComponent from './PostComponent.js';
import SeparatorComponent from './SeparatorComponent.js';

export default class PostFeedComponent {
  constructor(posts, flags = {
    body_clickable: true,
    user_clickable: true,
  }) {
    this.posts = posts;
    this.components = posts.map(post => {
      return {
        post: new PostComponent(post, flags),
        separator: new SeparatorComponent(10),
      }
    });
  }

  layout(man) {
    for (const { post, separator } of this.components) {
      post.layout(man);
      separator.layout(man);
    }
  }

  delete() {
    this._deleted = true;
    for (const { post, separator } of this.components) {
      post.delete();
      separator.delete();
    }
    this.components = [];
  }
}
