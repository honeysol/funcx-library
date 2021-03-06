export class AsyncCommitter {
  requestId = 0;
  commitId = 0;
  async resolve(promise) {
    this.requestId += 1;
    const currentRequestId = this.requestId;
    const value = await promise;
    if (currentRequestId <= this.commitId) {
      return { successed: false };
    }
    this.commitId = currentRequestId;
    return { successed: true, value };
  }
  async run(asyncFunction) {
    this.requestId += 1;
    const currentRequestId = this.requestId;
    const value = await asyncFunction();
    if (currentRequestId <= this.commitId) {
      return { successed: false };
    }
    this.commitId = currentRequestId;
    return { successed: true, value };
  }
  isRunning() {
    return this.requestId !== this.commitId;
  }
}
