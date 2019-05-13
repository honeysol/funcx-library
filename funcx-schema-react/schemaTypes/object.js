import React from "react";

import { InputComponent } from "../core.js";
import update from "immutability-helper";
import classnames from "classnames";

class Field extends InputComponent {
  onUpdateValue(value) {
    this.setValue(value);
  }
  render() {
    // const validationResult = this.getDisplayValidationResult(this.state);
    const Component = this.getComponent(this.state.params.schema, {});
    return (
      <div className={classnames("schemaItem", this.state.params.className)}>
        <span className="fieldHeader">{this.state.params.title}</span>
        <Component
          value={this.state.value}
          onUpdateValue={this.onUpdateValue}
          params={this.state.params.schema}
          system={this.props.system}
          context={this.props.context}
        />
      </div>
    );
  }
}

class ObjectValue extends InputComponent {
  onUpdateValue(value, propertyName) {
    if (propertyName != null) {
      this.setValue(
        update(this.state.value || {}, {
          $merge: {
            [propertyName]: value,
          },
        })
      );
    } else {
      this.setValue(
        update(this.state.value || {}, {
          $merge: value,
        })
      );
    }
  }
  getFieldValue(propertyName) {
    if (propertyName != null) {
      return (
        (this.state.value && this.state.value[propertyName]) ||
        (this.props.value && this.props.value[propertyName])
      );
    } else {
      return this.getValue();
    }
  }
  render() {
    const context = this.getContext();
    return (
      <div className={this.state.params.className}>
        {this.state.params.properties &&
          this.state.params.properties.map((property, index) => {
            const Component = property.component || Field;
            return (
              <Component
                key={`item-${index}`}
                index={index}
                params={property}
                value={this.getFieldValue(property.propertyName)}
                onUpdateValue={_value =>
                  this.onUpdateValue(_value, property.propertyName)
                }
                system={this.props.system}
                context={context}
              />
            );
          })}
      </div>
    );
  }
}
export const Value = ObjectValue;
