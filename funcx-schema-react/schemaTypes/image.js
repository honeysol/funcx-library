import React from "react";
import classnames from "classnames";
import { asyncComputed } from "mobx-library/mobx-async-computed";
import { component, render } from "mobx-library/mobx-react-component";
import { computed } from "mobx";

@component.pure
class ImageComponent extends React.Component {
  containerStyle = { padding: "10px" };
  @computed.struct
  get value() {
    return this.props.value;
  }
  @asyncComputed
  get blob() {
    if (typeof this.value === "string") {
      return this.value;
    } else {
      return (
        this.value?.id &&
        this.props.system.fileResource
          .fetchSession({
            id: this.value.id,
          })
          .getContent()
      );
    }
  }
  @computed
  get objectURL() {
    return this.updateCurrentObjectURL(this.blob);
  }
  updateCurrentObjectURL(blob) {
    if (this._objectURL) {
      URL.revokeObjectURL(this._objectURL);
      this._objectURL = null;
    }
    if (!blob || typeof blob === "string") {
      return blob;
    } else {
      this._objectURL = URL.createObjectURL(blob);
      return this._objectURL;
    }
  }
  componentWillUnmount() {
    super.componentWillUnmount && super.componentWillUnmount();
    this.updateCurrentObjectURL(null);
  }
  debugRef = React.createRef();

  @render
  get render() {
    return (
      <div className="schemaValueContainer">
        <div
          ref={this.debugRef}
          style={this.containerStyle}
          className={classnames("schemaValueImage", !this.objectURL && "hide")}
        >
          <img src={this.objectURL} style={{ width: "100%" }} />
        </div>
      </div>
    );
  }
}

export const Value = ImageComponent;

export const Display = ImageComponent;
