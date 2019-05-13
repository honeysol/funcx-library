import React from "react";
import { FuncxComponent } from "../core.js";

class Dynamic extends FuncxComponent {
  render() {
    // state.params is converted from props.params in FuncxComponent.
    const Component = this.getComponent(this.state.params.schema);
    return (
      <Component
        params={this.state.params.schema}
        value={this.props.value}
        onUpdateValue={this.props.onUpdateValue}
        system={this.props.system}
        context={this.props.context}
      />
    );
  }
}

export const Value = Dynamic;
export const Display = Dynamic;
