import { Session } from "./session";

import localForage from "localforage";

export class FileCacheResource {
  resource;
  constructor(resource) {
    this.resource = resource;
  }
  acceptUpload(blob) {
    return true;
  }
  acceptFetch(params) {
    return true;
  }
  uploadSession(blob) {
    const substantialSession = this.resource.uploadSession(blob);
    const session = new Session({
      content: _session => {
        return substantialSession.getContent();
      },
      params: _session => {
        return substantialSession.getParams();
      },
      upload: async _session => {
        console.log("start upload");
        const params = await substantialSession.getParams();
        await substantialSession.onUploaded();
        console.log("onUploaded");
        // アップロード完了後、非同期でファイルに保存する
        (async () => {
          const startTime = new Date().getTime();
          console.log("localForage.setItem(upload) start");
          await localForage.setItem(params.id, blob);
          console.log(
            "localForage.setItem(upload) finish",
            new Date().getTime() - startTime
          );
        })();
      },
    });
    substantialSession.on("progress", progressParam =>
      session.progress(progressParam)
    );
    return session;
  }
  fetchSession(params) {
    const session = new Session({
      params: _session => {
        return params;
      },
      content: async _session => {
        // ここでキャッシュを調べる
        const startTime = new Date().getTime();
        console.log("localForage.getItem start");
        const cachedContent = await localForage.getItem(params.id);
        console.log(
          "localForage.getItem finish",
          new Date().getTime() - startTime
        );
        if (cachedContent) {
          console.log("cache hit", params);
          return cachedContent;
        }
        const substantialSession = this.resource.fetchSession(params);
        substantialSession.on("progress", progressParam =>
          session.progress(progressParam)
        );
        const content = await substantialSession.getContent();
        // 非同期で保存する
        if (content) {
          (async () => {
            const startTime = new Date().getTime();
            console.log("localForage.setItem(download) start");
            await localForage.setItem(params.id, content);
            console.log(
              "localForage.setItem(download) finish",
              new Date().getTime() - startTime
            );
          })();
        }
        console.log("cache miss", params);
        return content;
      },
    });
    return session;
  }
}
