export class DelegatedResource {
  resources;
  constructor(resources) {
    this.resources = resources;
  }
  getUploadResource(blob) {
    for (const resource of this.resources) {
      if (resource.acceptUpload(blob)) {
        return resource;
      }
    }
    return null;
  }
  getFetchResource(params) {
    for (const resource of this.resources) {
      if (resource.acceptFetch(params)) {
        return resource;
      }
    }
    return null;
  }
}
