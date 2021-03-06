import React from "react";

import { InputComponent } from "../core.js";
import update from "immutability-helper";
import classnames from "classnames";
import _ from "lodash";

class Field extends InputComponent {
  onUpdateValue(value) {
    this.setValue(value);
  }
  render() {
    const Component =
      this.state.params.schema &&
      this.getComponent(this.state.params.schema, {});
    return (
      <div className={classnames("schemaItem", this.state.params.className)}>
        <span
          className={classnames(
            "fieldHeader",
            this.state.params.schema && this.state.params.schema.required
              ? "fieldHeaderRequired"
              : "fieldHeaderOptional"
          )}
        >
          {this.state.params.title}
        </span>
        {this.state.params.schema && (
          <Component
            value={this.state.value}
            onUpdateValue={this.onUpdateValue}
            params={this.state.params.schema}
            system={this.props.system}
            context={this.props.context}
          />
        )}
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
  updateEditingValue(newValue) {
    if (!_.isEqual(newValue, this.state.value)) {
      this.setValue(newValue);
    }
  }
  render() {
    const context = this.getContext();
    const validationResult = this.getDisplayValidationResult(this.state);
    const value = this.getValue();
    return (
      <div className={this.state.params.className}>
        <div className="objectProperties">
          {this.state.params.properties &&
            this.state.params.properties.map((property, index) => {
              const Component = property.component || Field;
              return (
                <Component
                  key={`item-${index}`}
                  index={index}
                  params={property}
                  value={
                    property.propertyName != null && value
                      ? value[property.propertyName]
                      : value
                  }
                  onUpdateValue={(_value) =>
                    this.onUpdateValue(_value, property.propertyName)
                  }
                  system={this.props.system}
                  context={
                    !property.propertyName
                      ? context
                      : {
                          ...context,
                          position: [
                            ...(context.position || []),
                            property.propertyName,
                          ],
                        }
                  }
                />
              );
            })}
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
export const Value = ObjectValue;
