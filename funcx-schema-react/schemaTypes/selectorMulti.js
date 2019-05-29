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
  onSelect(selectedItem) {
    const array = Array.isArray(this.state.value) ? this.state.value : [];
    if (array.includes(selectedItem.id)) {
      this.setValue(array.filter(item => item !== selectedItem.id));
    } else {
      this.setValue(array.concat([selectedItem.id]));
    }
    this.onBlur();
  }
  isActive(item) {
    const array = Array.isArray(this.state.value) ? this.state.value : [];
    return array.includes(item.id);
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
                  type="checkbox"
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
