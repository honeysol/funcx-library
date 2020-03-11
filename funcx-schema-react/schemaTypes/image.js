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
  get image() {
    if (typeof this.value === "string") {
      return this.value;
    } else {
      return this.props.system.fileResource
        .fetchSession({
          id: this.value.id,
        })
        .getContent();
    }
  }
  @computed
  get imageURL() {
    return this.updateCurrentImageURL(this.image);
  }
  updateCurrentImageURL(image) {
    if (this._imageURL) {
      URL.revokeObjectURL(this._imageURL);
      this._imageURL = null;
    }
    if (!image || typeof image === "string") {
      return image;
    } else {
      this._imageURL = URL.createObjectURL(image);
      return this._imageURL;
    }
  }
  componentWillUnmount() {
    super.componentWillUnmount?.();
    this.updateCurrentImageURL(null);
  }
  debugRef = React.createRef();

  @render
  get render() {
    return (
      <div className="schemaValueContainer">
        <div
          ref={this.debugRef}
          style={this.containerStyle}
          className={classnames("schemaValueImage", !this.imageURL && "hide")}
        >
          <img src={this.imageURL} style={{ width: "100%" }} />
        </div>
      </div>
    );
  }
}

export const Value = ImageComponent;

export const Display = ImageComponent;
