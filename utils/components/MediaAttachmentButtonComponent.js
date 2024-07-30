import { gotoMedia } from "../navigation";
import ButtonComponent from "./ButtonComponent";

//TODO something more elaborate than this :p
// Maybe just add an icon or a tiny image preview?

export default class MediaAttachmentButtonComponent extends ButtonComponent {
  constructor(attachment) {
    super("View attachment", () => {
      if (attachment.type === "image") {
        gotoMedia(attachment.url);
      } else {
        hmUI.showToast({
          text: `Unsupported attachment type: ${attachment.type}`,
        });
      }
    });
  }
}
