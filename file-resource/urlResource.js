import axios from "axios";

import { Session } from "./session";

export class UrlResource {
  acceptUpload(blob) {
    return false;
  }
  acceptFetch(params) {
    return params.url;
  }
  uploadSession(blob) {
    throw new Error("not implemented");
  }
  fetchSession(params) {
    return new Session({
      params: (session) => {
        return params;
      },
      content: async (session) => {
        const response = await axios.get(params.url, {
          responseType: "arraybuffer",
          onDownloadProgress: (e) => {
            session.progress({
              progressType: "download",
              detail: "publicHttp",
              progress: e.loaded / e.total,
            });
          },
        });
        console.log(response);
        if (response && response) {
          return new Blob([response.data], {
            type: response.headers["content-type"],
          });
        } else {
          return null;
        }
      },
    });
  }
}
