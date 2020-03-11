import React from "react";
import * as validators from "../validators";
import { InputComponent } from "../core.js";
import { component, render } from "mobx-library/mobx-react-component";
import { computed } from "mobx";
import path from "path";

class DisplayFilename extends React.Component<any, any> {
  render() {
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          <span className="schemaValueDisplay">
            {this.props.value && this.props.value.filename}
          </span>
        </div>
      </div>
    );
  }
}

@component.pure
class MultiTypeValue extends InputComponent {
  validators = [validators.required];

  @computed.struct
  get value() {
    return this.props.value;
  }
  @computed
  get component() {
    const componentFromMimeType = this.props.system.fileType.mimeType[
      (this.value?.mimeType)
    ];
    if (componentFromMimeType) {
      return componentFromMimeType.Value;
    }
    const componentFromExtensionName = this.props.system.fileType.extensionName[
      path.extname(this.value?.filename)
    ];
    if (componentFromExtensionName) {
      return componentFromExtensionName.Value;
    }
    return DisplayFilename;
  }

  @render
  get render() {
    const Component = this.component;
    return Component && <Component {...this.props} />;
  }
}

export const Value = MultiTypeValue;
