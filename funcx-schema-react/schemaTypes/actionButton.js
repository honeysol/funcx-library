import React from "react";
import * as validators from "../validators";
import { FuncxComponent } from "../core.js";
import classnames from "classnames";

export class Value extends FuncxComponent {
  validators = [validators.required];
  onSelect(item) {
    this.state.params.onSelect(item, this.props);
  }
  isActive(item) {
    return this.state.params.isActive(item, this.props);
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
  render() {
    return <div className="schemaValue">{this.props.value}</div>;
  }
}
