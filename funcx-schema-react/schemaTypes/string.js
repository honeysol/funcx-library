import React from "react";
import * as validators from "../validators";
import { InputComponent } from "../core.js";

export class Value extends InputComponent {
  validators = [validators.required, validators.pattern];
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          <input
            type="text"
            value={this.state.value || ""}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            placeholder={this.state.params.placeholder}
          />
        </div>
        {validationResult && (
          <div className="errorMessage">
            {this.s(validationResult.stringId)}
          </div>
        )}
      </div>
    );
  }
}

export class Display extends React.Component {
  render() {
    return (
      <div className="schemaValue schemaValueDisplay">{this.props.value}</div>
    );
  }
}
