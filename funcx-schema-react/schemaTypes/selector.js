import React from "react";
import * as validators from "../validators";
import { FuncxComponent } from "../core.js";
import classnames from "classnames";

let selectorId = 1;

export class Value extends FuncxComponent {
  validators = [validators.required];
  constructor(...args) {
    super(...args);
    ++selectorId;
    this.selectorId = selectorId;
  }
  onSelect(item) {
    if (this.state.value && item && this.state.value.id === item.id) {
      this.setValue(null);
    } else {
      this.setValue(item);
    }
    this.onBlur();
  }
  isActive(item) {
    return (
      (item && item.id) === ((this.state.value && this.state.value.id) || null)
    );
  }
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          <div
            className={classnames("selectorList", {
              focused: this.state.focused,
            })}
          >
            {this.props.params.options.map((item, index) => (
              <span
                key={index}
                className={classnames("selectorItem", {
                  selectorItemActive: this.isActive(item),
                })}
              >
                <input
                  type="radio"
                  className={this.isActive(item) && "debug_active"}
                  name={"selector" + this.selectorId}
                  onClick={() => {
                    this.onSelect(item);
                  }}
                  checked={this.isActive(item)}
                />
                <span>{item.title}</span>
              </span>
            ))}
          </div>
        </div>
        {validationResult && (
          <div className="errorMessage">
            {validationResult && validationResult.message}
          </div>
        )}
      </div>
    );
  }
}

export class Display extends React.Component {
  isActive(item) {
    return (
      (item && item.id) === ((this.props.value && this.props.value.id) || null)
    );
  }
  render() {
    const selectedOption =
      this.props.params.options &&
      this.props.params.options.find(option => option && this.isActive(option));
    return (
      <div className="schemaValue schemaValueDisplay">
        {selectedOption && selectedOption.title}
      </div>
    );
  }
}
