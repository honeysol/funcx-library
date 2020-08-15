// @flow

import EventEmitter from "events";
import stringify from "json-stable-stringify";
import { Buffer } from "buffer";
import { createBrowserHistory, createMemoryHistory } from "history";
const canUseDOM = true;

/** @abstract */
class StateHistory {
  /** @ignore */
  showLocalValue = true;
  /** @ignore */
  localValue: any;
  /** @ignore */
  localData: string;
  /** @ignore */
  urlPath: string;
  /** @ignore */
  options: any;
  /** @ignore */
  path: string;
  /** @ignore */
  emitter = new EventEmitter();
  /** @ignore */
  unlistenHistoryChange: any;
  /** @ignore */
  history: any;
  /** Constructor
   * @param {{onPathChange: function}} options options
   */
  constructor(options: { onPathChange: (path: string, value: any) => void }) {
    this.options = options || {};
    if (this.options.onPathChange) {
      this.emitter.on("pathChange", this.options.onPathChange);
    }
    const historyType =
      this.options.historyType || (canUseDOM ? "browser" : "memory");
    if (historyType === "browser") {
      this.history = createBrowserHistory();
    } else {
      this.history = createMemoryHistory();
    }
    const currentState = this.parsePath();
    this.updatePath(
      { path: currentState.path },
      {
        enableEvent: true,
        localData: currentState.localData,
      }
    );
    this.unlistenHistoryChange = this.history.listen(this.onHistoryChange);
  }
  /** Register listner
   * @param {function(path: string, value: any): void} listener listener
   */
  on(listener: (path: string, value: any) => void): void {
    this.emitter.on("pathChange", listener);
  }
  /** Remove listner
   * @param {function(path: string, value: any): void} listener listener
   */
  off(listener: Function) {
    this.emitter.removeListener("pathChange", listener);
  }
  /** Release all resources */
  close() {
    this.unlistenHistoryChange();
  }
  /** Alias of this.history.back() */
  back() {
    this.history.goBack();
  }
  /** Alias of this.history.forward() */
  forward() {
    this.history.goForward();
  }
  /** @ignore */
  parsePath() {
    throw new Error("not implemented");
  }
  /** @ignore */
  compoundPath(path: string, localData: any) {
    throw new Error("not implemented");
  }
  /** @ignore */
  onHistoryChange = (location: string, action: string) => {
    if (action === "REPLACE" || action === "PUSH") {
      return;
    }
    const currentState = this.parsePath();
    this.updatePath(
      { path: currentState.path },
      {
        enableEvent: true,
        localData: currentState.localData,
      }
    );
  };
  /** @ignore */
  toData(value: any) {
    return value && Buffer.from(stringify(value)).toString("base64");
  }
  /** @ignore */
  fromData(data: string) {
    return data && JSON.parse(Buffer.from(data, "base64").toString());
  }
  /** show localValue as URL */
  showLocalValue(showLocalValue: boolean = true) {
    this.showLocalValue = showLocalValue;
    this.updatePath({ path: this.path }, { localData: this.localData });
  }
  /** hide localValue as URL */
  hideLocalValue(showLocalValue: boolean = false) {
    this.showLocalValue = !showLocalValue;
    this.updatePath({ path: this.path }, { localData: this.localData });
  }

  /**
   * Update inner state
   * @param {string} newPath newPath
   * @param {Object} value arbitrary value
   * @param {{title: string}} option options
   */
  updatePath(
    { path, value }: { path: string, value?: any },
    option?: {
      enableEvent?: boolean,
      localData: string,
      title?: string,
      push?: boolean,
    }
  ) {
    const newPath = path || this.path;
    const { enableEvent, title, push } = option || {};
    let localData: string = (option || {}).localData;
    if (!localData && value) {
      localData = this.toData(value);
    }

    // param -> path(& state)
    const currentState = this.parsePath();
    const urlPath = this.compoundPath(newPath, localData);
    if (
      localData !== currentState.localData ||
      urlPath !== this.urlPath ||
      newPath !== currentState.path
    ) {
      if (push) {
        this.history.push(urlPath, { localData: localData });
      } else {
        this.history.replace(urlPath, { localData: localData });
      }
    }
    if (title) {
      document.title = title;
    }
    // path(& state) -> inner, param
    if (this.urlPath !== urlPath) {
      this.urlPath = urlPath;
      if (this.path !== newPath) {
        this.path = newPath;
      }
      if (this.localData !== localData) {
        this.localData = localData;
        this.localValue = this.fromData(localData);
      }
      if (enableEvent) {
        this.emitter.emit("pathChange", this.getCurrentParam());
      }
    }
  }
  /**
   * get current state
   */
  getCurrentParam(): { path: string, value: any } {
    return {
      path: this.path,
      value: this.localValue,
    };
  }
}

/**
 * Implementation of StateHistory with this.history.location.pathname and locaiton.query
 * @example
 * // URL
 * /user/1234?eyJvcHRpb25zIjp7ImxhbmciOiJqYSJ9fQ==
 * // getCurrentParam()
 * { "path": "/user/1234", "value": {"lang": "en"}}
 */
export class PathStateHistory extends StateHistory {
  /** @ignore */
  parsePath() {
    return {
      path: this.history.location.pathname,
      localData:
        (this.history.location.search &&
          this.history.location.search.slice(1)) ||
        (this.history.location.state && this.history.location.state.localData),
    };
  }
  /** @ignore */
  compoundPath(path: string, localData: any) {
    return path + (localData && this.showLocalValue ? "?" + localData : "");
  }
}

/**
 * Implementation of StateHistory with this.history.location.hash
 * @example
 * // URL
 * /somepath#/user/1234?eyJvcHRpb25zIjp7ImxhbmciOiJqYSJ9fQ==
 * // getCurrentParam()
 * { "path": "/user/1234", "value": {"lang": "en"}}
 */
export class HashStateHistory extends StateHistory {
  /** @ignore */
  parsePath() {
    const path =
      (this.history.location.hash && this.history.location.hash.slice(1)) ||
      "/";
    const match = path.match(/^([^?]+)(?:\?(.*))?$/);
    return (
      (match && {
        path: match[1],
        localData:
          match[2] ||
          (this.history.location.state &&
            this.history.location.state.localData),
      }) ||
      {}
    );
  }
  // queryRestrinctionで示されたパラメータだけを引き継いたURLSearchParamsを新たに作成して返す
  getSearchParams() {
    const oldSearchQuery = new URLSearchParams(this.history.location.search);
    if (this.options.queryRestriction) {
      const newSearchQuery = new URLSearchParams();
      for (const key of this.options.queryRestriction) {
        if (oldSearchQuery.has(key)) {
          newSearchQuery.append(key, oldSearchQuery.get(key));
        }
      }
      return newSearchQuery;
    } else {
      return oldSearchQuery;
    }
  }
  getSearchString(params) {
    const searchParams = this.getSearchParams();
    if (params) {
      for (const key of Object.keys(params)) {
        searchParams.append(key, params[key]);
      }
    }
    const searchString = searchParams.toString();
    return searchString ? "?" + searchString : "";
  }

  /** @ignore */
  compoundPath(path: string, localData: any) {
    return (
      this.history.location.pathname +
      this.getSearchString() +
      "#" +
      path +
      (localData && this.showLocalValue ? "?" + localData : "")
    );
  }
}
