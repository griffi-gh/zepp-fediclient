import PostComponent from './PostComponent.js';
import SeparatorComponent from './SeparatorComponent.js';

export default class PostFeedComponent {
  constructor(posts) {
    this.posts = posts;
    this.components = posts.map(post => {
      return {
        post: new PostComponent(post),
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
    for (const { post, separator } of this.components) {
      post.delete();
      separator.delete();
    }
  }
}
