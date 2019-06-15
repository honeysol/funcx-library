import React from "react";
import * as validators from "../validators";
import { FuncxComponent } from "../core.js";
import classnames from "classnames";

let selectorId = 1;

export class Value extends FuncxComponent {
  validators = [validators.requireValue];
  constructor(...args) {
    super(...args);
    ++selectorId;
    this.selectorId = selectorId;
  }
  onSelect() {
    this.setValue(!this.state.value);
    this.onBlur();
  }
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div
        className={classnames(
          "schemaValueContainer",
          this.state.params.className
        )}
      >
        <div className="schemaValue">
          <div className="schemaValueBoolean">
            <span
              className={classnames("selectorItem", {
                selectorItemActive: this.state.value,
              })}
              onClick={() => {
                this.onSelect();
              }}
            >
              <input
                type="checkbox"
                className={this.state.value && "debug_active"}
                name={"boolean-" + this.selectorId}
                id={`boolean-${this.selectorId}`}
                checked={this.state.value}
              />
              <label htmlFor={`boolean-item-${this.selectorId}`}>
                {this.state.params.title}
              </label>
            </span>
          </div>
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

export class Display extends FuncxComponent {
  render() {
    return (
      <div className="schemaValue schemaValueDisplay">
        {this.state.value
          ? this.state.params.title
          : this.state.params.titleNotChecked}
      </div>
    );
  }
}
