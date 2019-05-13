// @flow

import React from "react";
import { RouteMatcher } from "funcx-router/src";

const cloneChildren = (children, props) => {
  if (Array.isArray(children)) {
    return React.Children.map(props, child => {
      return cloneChildren(child, props);
    });
  } else if (typeof children === "object") {
    return React.cloneElement(children, props);
  } else {
    return children;
  }
};

export class AbstractRouter extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = this.getState(props);
  }
  componentWillReceiveProps(newProps: any) {
    this.setState(this.getState(newProps));
  }
  getState(props: any) {
    return { routeParams: props.routeParams };
  }
  onUpdateRouteParams = (routeParams: any) => {
    this.props.onUpdateRouteParams(routeParams);
  };
  render() {
    const props = {
      // Common
      system: this.props.system,
      context: this.props.context,
      // For Child Router
      routeParams: this.state.routeParams,
      onUpdateRouteParams: this.onUpdateRouteParams,
      // For Component
      value: this.state.routeParams && this.state.routeParams.value,
      params: this.state.routeParams && this.state.routeParams.params,
      onUpdateValue: value => {
        this.onUpdateRouteParams(
          Object.assign({}, this.state.routeParams, { value: value })
        );
      },
      onClosed: response => {
        if (this.state.routeParams.params.onClosed) {
          this.state.routeParams.params.onClosed(response, props);
        }
      },
    };
    const Component =
      this.state.routeParams &&
      this.state.routeParams.params &&
      this.state.routeParams.params.component;
    if (Component) {
      return <Component {...props} />;
    } else if (this.props.children) {
      const component = cloneChildren(this.props.children, props);
      return component;
    } else {
      console.error("No component specified", this.props.routeParams);
      return <ErrorComponent />;
    }
  }
}

class ErrorComponent extends React.Component<any, any> {
  render() {
    return <div>Component not found</div>;
  }
}

export class MatchRouter extends AbstractRouter {
  routes: any;
  routeMatcher: RouteMatcher;
  updateRoute(props: any) {
    const newRoutes =
      props.routes ||
      (props.routeParams.params && props.routeParams.params.routes);
    if (this.routes !== newRoutes) {
      this.routes = newRoutes;
      this.routeMatcher = new RouteMatcher(this.routes);
    }
    if (!this.routes) {
      console.error("routes not specified for MatchRouter", this);
    }
  }
  // Upper to Lower (path to param / value)
  getState(props: any) {
    this.updateRoute(props);
    const routeParams: any = this.routeMatcher.next(props.routeParams);
    return { routeParams };
  }
  onUpdateRouteParams = (routeParams: any) => {
    this.props.onUpdateRouteParams(this.routeMatcher.reverse(routeParams));
    this.setState({ routeParams });
  };
}
export class SelectorRouter extends MatchRouter {
  // Upper to Lower
  getState(props: any) {
    this.updateRoute(props);
    const routeParams: any = this.routeMatcher.select(props.routeParams);
    return { routeParams };
  }
}

export class HistoryRouter extends AbstractRouter {
  routeMatcher: RouteMatcher;
  constructor(props: any) {
    super(props);
    props.history.on(this.onPathChange);
  }
  getState(props: any) {
    return { routeParams: props.history.getCurrentParam() };
  }
  onPathChange = (routeParams: any) => {
    this.setState({ routeParams: routeParams });
  };
  onUpdateRouteParams = (routeParams: any) => {
    // Take { value }  as routeParams in this context
    this.props.history.updatePath(routeParams, { push: true });
    this.setState({ routeParams });
  };
}
