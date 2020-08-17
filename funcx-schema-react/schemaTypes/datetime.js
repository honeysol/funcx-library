import React from "react";
import moment from "moment";
import * as validators from "funcx-schema-react/validators";
import { FuncxComponent } from "funcx-schema-react/core.js";

const dateTimeLocalFormat = "YYYY-MM-DDTHH:mm";

class DateDisplay extends React.Component {
  render() {
    return (
      <div className="schemaValue schemaValueDisplay">
        {moment(this.props.value).format("YYYY/MM/DD HH:mm:ss")}
      </div>
    );
  }
}

export class DateValue extends FuncxComponent {
  validators = [validators.required, validators.pattern];
  onChange = (e) => {
    this.setValue(
      e.target.value
        ? moment(e.target.value, dateTimeLocalFormat).valueOf()
        : null
    );
  };
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          {JSON.stringify(this.state.value)}
          <input
            type="datetime-local"
            value={
              this.state.value
                ? moment(this.state.value).format(dateTimeLocalFormat)
                : null
            }
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

export const Value = DateValue;
export const Display = DateDisplay;
