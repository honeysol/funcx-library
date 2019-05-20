import React from "react";
import * as validators from "../validators";
import { FuncxComponent } from "../core.js";
import classnames from "classnames";

export class Value extends FuncxComponent {
  validators = [validators.required];
  onSelect(item) {
    if (this.state.value && item && this.state.value.id === item.id) {
      this.setValue(null);
    } else {
      this.setValue(item);
    }
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
          <div className="selectorList">
            {this.props.params.options.map((item, index) => (
              <span
                key={index}
                className={classnames("selectorItem", {
                  selectorItemActive: this.isActive(item),
                })}
                onClick={() => {
                  this.onSelect(item);
                }}
              >
                {item.title}
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
    const selectedOption = this.props.params.options && this.props.params.options.find(option => option && this.isActive(option));
    return <div className="schemaValue schemaValueDisplay">{selectedOption && selectedOption.title}</div>;
  }
}
