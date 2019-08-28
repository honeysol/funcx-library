import crypto from "crypto";
import { Session } from "./session";

const waitTime = 100;

const getRandomHexString = byte => {
  return crypto.randomBytes(byte).toString("hex");
};
const wait = (time, value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, time);
  });
};

export class MemoryResource {
  resource = {};
  acceptUpload(blob) {
    return true;
  }
  acceptFetch(params) {
    return true;
  }
  uploadSession(blob) {
    return new Session({
      content: session => {
        return blob;
      },
      params: async session => {
        await wait(waitTime);
        return {
          id: getRandomHexString(32),
          filename: blob.name,
        };
      },
      upload: async session => {
        const params = await session.getParams();
        const step = 10;
        for (let i = 0; i <= step; i += 1) {
          await wait(waitTime);
          session.progress({
            progress: i / step,
            progressType: "upload",
          });
        }
        this.resource[params.id] = blob;
      },
    });
  }
  fetchSession(params) {
    return new Session({
      params: session => {
        return params;
      },
      content: async session => {
        const step = 10;
        for (let i = 0; i <= step; i += 1) {
          await wait(waitTime);
          console.log(i, "download", params.id);
          session.progress({
            progress: i / step,
            progressType: "download",
          });
        }
        console.log("finished", "download", params.id);
        return this.resource[params.id];
      },
    });
  }
}
