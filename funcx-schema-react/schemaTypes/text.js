import React from "react";
import { FuncxComponent } from "funcx-schema-react/core.js";

export class TextDisplay extends FuncxComponent {
  render() {
    return (
      <div className="schemaValue schemaValueDisplay schemaValueText">
        {this.state.params.content}
      </div>
    );
  }
}

export const Value = TextDisplay;
export const Display = TextDisplay;
