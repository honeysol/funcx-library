import { DelegatedResource } from "./delegatedResource";

export class SessionCacheResource extends DelegatedResource {
  resource;
  cache = new Map();
  acceptUpload(blob) {
    return true;
  }
  acceptFetch(params) {
    return true;
  }
  uploadSession(blob) {
    const resource = this.getUploadResource(blob);
    const session = resource.uploadSession(blob);
    (async () => {
      const params = await session.getParams();
      this.cache[params.id] = session;
    })();
    return session;
  }
  fetchSession(params) {
    if (!this.cache[params.id]) {
      const resource = this.getFetchResource(params);
      const session = resource.fetchSession(params);
      this.cache[params.id] = session;
    }
    return this.cache[params.id];
  }
}
