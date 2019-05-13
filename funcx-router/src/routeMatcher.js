// @flow

import pathToRegexp from "path-to-regexp";

/** @ignore */
interface Route {
  value: any;
  params: any;
  childPath?: ?string;
}

/** @ignore */
class RouteEntry {
  /** @ignore */
  params: any;
  /** @ignore */
  value: any;
  /** @ignore */
  id: string;
  /** @ignore */
  regexp: RegExp;
  /** @ignore */
  toPath: any => string;
  /** @ignore */
  keys = [];
  /** @ignore */
  isStar: boolean;
  /** @ignore */
  isPrefix: boolean;
  /** @ignore */
  childMatcher: RouteMatcher;
  /** @ignore */
  constructor(routeSetting: {
    params: any,
    id: string,
    path: string,
    value: any,
    children: any,
    isPrefix: boolean,
  }) {
    this.params = routeSetting.params;
    this.value = routeSetting.value;
    this.id = routeSetting.id;
    const pathOptions = Object.assign(
      ({ end: !routeSetting.isPrefix && !routeSetting.children }: any),
      routeSetting
    );
    this.isPrefix = !pathOptions.end;
    this.regexp = pathToRegexp(routeSetting.path, this.keys, pathOptions);
    this.toPath = pathToRegexp.compile(routeSetting.path);
    this.isStar = routeSetting.path === "*";
    if (routeSetting.children) {
      this.childMatcher = new RouteMatcher(routeSetting.children);
    }
  }
  /** @ignore */
  matchPath(path: string): ?Route {
    if (path === null) {
      return null;
    }
    if (this.isStar) {
      return {
        value: {
          rawPath: this.decodeParam(path),
          id: this.id,
        },
        params: this.params,
      };
    }
    const match = this.regexp.exec(path);
    if (!match) {
      return null;
    }
    const value = { id: this.id };
    for (let i = 1; i < match.length; i += 1) {
      const key = this.keys[i - 1];
      const val = this.decodeParam(match[i]);
      if (
        val !== undefined ||
        !Object.prototype.hasOwnProperty.call(value, key.name)
      ) {
        if (key.repeat && val) {
          value[key.name] = val.split(key.delimiter);
        } else {
          value[key.name] = val;
        }
      }
    }
    let childPath: ?string = null;
    if (this.isPrefix) {
      childPath = path.slice(match[0].length);
    }
    return {
      value,
      params: this.params,
      childPath: childPath,
    };
  }
  /** @ignore */
  matchValue(value: any, withoutPath: boolean = false) {
    const newValue = Object.assign({}, value);
    if (value.id !== this.id) {
      return false;
    }
    if (this.value) {
      for (const key of Object.keys(this.value)) {
        if (this.value[key] !== newValue[key]) {
          return false;
        }
        delete newValue[key];
      }
    }
    for (const key of this.keys) {
      delete newValue[key.name];
    }
    return {
      path: !withoutPath && this.toPath(value),
      params: this.params,
      value: newValue,
    };
  }
  /** @ignore */
  decodeParam(val: any) {
    if (typeof val !== "string" || val.length === 0) {
      return val;
    }
    try {
      return decodeURIComponent(val);
    } catch (err) {
      if (err instanceof URIError) {
        err.message = `Failed to decode param '${val}'`;
        err.status = 400;
        err.statusCode = 400;
      }
      throw err;
    }
  }
}

/** Covert Route value and path to the each other */
export class RouteMatcher {
  /** @ignore */
  routeEntries: RouteEntry[];
  /** @ignore */
  routeEntryMap = { RouteEntry };
  /**
   * routeSettings: {
   *    params: any,
   *    id: string,
   *    path: string,
   *    children: any,
   *    isPrefix: boolean,
   *  }[]
   * @param {{}[]} routeSettings
   */
  constructor(
    routeSettings: {
      params: any,
      id: string,
      path: string,
      children: any,
      value: any,
      isPrefix: boolean,
    }[]
  ) {
    this.routeEntries = routeSettings.map(routeSetting => {
      const routeEntry = new RouteEntry(routeSetting);
      this.routeEntryMap[routeSetting.id] = routeEntry;
      return routeEntry;
    });
  }
  /**
   * Convert path string to route value
   * @return {
   *     value: any,
   *     params: any
   *  }
   */
  routeOld(path: string, localValue: {} = {}): ?Route {
    for (const routeEntry of this.routeEntries) {
      const response: any = routeEntry.matchPath(path);
      if (response) {
        if (response.childPath && routeEntry.childMatcher) {
          const childResponse = routeEntry.childMatcher.routeOld(
            response.childPath
          );
          if (childResponse) {
            Object.assign({}, localValue, response.value, childResponse.value, {
              id: response.value.id + "." + childResponse.value.id,
            });
            response.params = Object.assign(
              {},
              response.params,
              childResponse.params
            );
          }
          delete response.childPath;
        }
        return response;
      }
    }
    return null;
  }
  // path, value, params -> path, value, params (upper to lower)
  next({
    path,
    value,
    params,
  }: {
    path: string,
    value: Object,
    params: Object,
  }) {
    for (const routeEntry of this.routeEntries) {
      const response: any = routeEntry.matchPath(path);
      if (response) {
        return {
          params: Object.assign({}, params, response.params),
          value: Object.assign({}, value, response.value),
          path: response.childPath,
        };
      }
    }
    return null;
  }
  // path, value, params -> path, value, params (upper to lower)
  select({ value, params }: { value: Object, params: Object }) {
    for (const routeEntry of this.routeEntries) {
      const response: any = routeEntry.matchValue(value, true);
      if (response) {
        return {
          params: Object.assign({}, params, response.params),
          value: Object.assign({}, value, response.value),
        };
      }
    }
    return null;
  }
  reverse({ path, value }: { path: string, value: Object }) {
    for (const routeEntry of this.routeEntries) {
      const response: any = routeEntry.matchValue(value);
      if (response) {
        return {
          value: response.value,
          path: response.path + (path || ""),
        };
      }
    }
    return null;
  }
  /**
   * Convert route value to path string
   * @param {Object} param param
   * @param {string[]} ids internal use
   */
  toPath(param: any, _ids: ?(string[]) = null): string {
    const ids = _ids || param.id.split(".");
    const id = ids[0];
    if (!id) {
      return "";
    }
    const routeEntry = this.routeEntryMap[id];
    let path = routeEntry.toPath(param);
    if (ids.length > 1 && routeEntry.childMatcher) {
      path += routeEntry.childMatcher.toPath(param, ids.slice(1));
    }
    return path;
  }
}
