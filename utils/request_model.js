// const Buffer = DeviceRuntimeCore.Buffer;

// export class RequestHelper {
//   constructor() {
//     messaging.peerSocket.addListener('message', message => {
//       this._on_message_handler(message);
//     });
//     this.handlers = {};
//   }

//   _on_message_handler(message) {
//     const message_data = JSON.parse(Buffer.from(message).toString('utf-8'));
//     console.log("msg: " + JSON.stringify(message_data));
//     for (const handler of this.handlers[message_data.request]) {
//       handler(message_data.data);
//     }
//   }

//   on_message(message, handler) {
//     if (this.handlers[message] == null) {
//       this.handlers[message] = [];
//     }
//     this.handlers[message].push(handler);
//   }

//   request(req_type, cb) {
//     //TODO remove properly
//     let burn = false;
//     this.on_message(req_type, data => {
//       if (burn) return;
//       if (data.respose != req_type) return;
//       burn = true;
//       cb(data);
//     });

//     const buf = Buffer.from(JSON.stringify({
//       request: req_type,
//     }));

//     // messaging.peerSocket.send();
//     hmBle.send(buf.buffer, buf.byteLength);
//   }

//   //TODO destructor
// }
