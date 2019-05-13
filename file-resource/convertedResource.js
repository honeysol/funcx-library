import { Session } from "file-resource/session";

export class ConvertedResource {
  resource;
  plugins = {};
  constructor(resource) {
    this.resource = resource;
    this.uploadSession = resource.uploadSession.bind(resource);
  }
  acceptUpload(blob) {
    return true;
  }
  acceptFetch(params) {
    return true;
  }
  fetchSession(params, { original } = {}) {
    const substantialSession = this.resource.fetchSession(params);
    if (original) {
      return substantialSession;
    }
    const session = new Session({
      params: _session => {
        return params;
      },
      content: async _session => {
        const content = await substantialSession.getContent();
        if (!content) {
          return content;
        }
        const [__dammy_whole, typePart] = content.type.match(
          /^([a-zA-Z0-9/-]+)/
        );
        if (this.plugins[typePart]) {
          for (const plugin of this.plugins[typePart]) {
            if (plugin.accept(content)) {
              const response = await plugin.convert(content);
              return response;
            }
          }
        }
        return content;
      },
      upload: _session => {
        return substantialSession.onUploaded();
      },
    });
    substantialSession.on("progress", progressParam =>
      session.progress(progressParam)
    );
    return session;
  }
}
