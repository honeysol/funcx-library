import EventEmitter from "events";

export class Session {
  emitter;
  params;
  content;
  constructor({ params, content, upload, substantialSession }) {
    this.params = params && params(this);
    this.content = content && content(this);
    this.upload = upload && upload(this);
    this.emitter = substantialSession
      ? substantialSession.emitter
      : new EventEmitter();
    this.exec();
  }
  async exec() {
    await Promise.all([this.params, this.content, this.upload]);
    this.finish();
  }
  // async
  getParams() {
    return this.params;
  }
  // async
  getContent() {
    return this.content;
  }
  // async
  onParams() {
    return this.params;
  }
  // async
  onContent() {
    return this.content;
  }
  // async
  onUploaded() {
    return this.upload;
  }
  on(eventName, listener) {
    return this.emitter.on(eventName, listener);
  }
  once(eventName, listener) {
    if (listener) {
      return this.emitter.once(eventName, listener);
    } else {
      return new Promise((fulfilled) => {
        this.emitter.once(eventName, (result) => {
          fulfilled(result);
        });
      });
    }
  }
  onFinish() {
    return this.once("finish");
  }
  onAbort() {
    return this.once("abort");
  }
  progress(params) {
    this.emitter.emit("progress", params);
  }
  finish(result) {
    this.emitter.emit("finish", result);
    setTimeout(() => {
      this.emitter.emit("progress", {
        progressType: "finish",
        progress: null,
      });
      this.emitter.removeAllListeners();
    }, 500);
  }
  abort(reason) {
    this.emitter.emit("abort", reason);
    this.emitter.emit("progress", {
      progressType: "abort",
      progress: null,
    });
    this.emitter.removeAllListeners();
  }
}
