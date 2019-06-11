import React from "react";
import { FuncxComponent } from "funcx-schema-react/core.js";
import classnames from "classnames";

export class TextDisplay extends FuncxComponent {
  render() {
    return (
      <div
        className={classnames(
          "schemaValue schemaValueDisplay schemaValueText",
          this.state.params.className
        )}
      >
        {this.state.params.content}
      </div>
    );
  }
}

export const Value = TextDisplay;
export const Display = TextDisplay;
