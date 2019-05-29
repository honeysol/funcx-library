import React from "react";
import * as validators from "../validators";
import { InputComponent } from "../core.js";
import classnames from "classnames";
import ReactDOM from "react-dom";

const urlToImage = url => {
  return new Promise((fulfilled, rejected) => {
    const image = new Image();
    image.addEventListener(
      "load",
      () => {
        fulfilled(image);
      },
      false
    );
    image.addEventListener(
      "error",
      e => {
        rejected(e);
      },
      false
    );
    image.src = url;
  });
};

const blobToImage = async blob => {
  const url = URL.createObjectURL(blob);
  try {
    const image = await urlToImage(url);
    URL.revokeObjectURL(url);
    return image;
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
};

class ImageComponent extends InputComponent {
  validators = [validators.required];
  oldId;
  containerStyle = { padding: "10px" };
  setValue(value) {
    super.setValue(value);
    this.setValueAsync(value);
  }
  async setValueAsync(value) {
    if ((this.oldValue && this.oldValue.id) === (value && value.id)) {
      return;
    }
    this.oldValue = value;
    let container = ReactDOM.findDOMNode(this.refs.container);
    if (container && container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (value) {
      const file = await this.props.system.fileResource
        .fetchSession({
          id: value.id,
        })
        .getContent();
      if (!file) {
        return;
      }
      const image = await blobToImage(file);
      image.style.width = "100%";
      container = ReactDOM.findDOMNode(this.refs.container);
      if (container) {
        if (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(image);
        this.oldValue = value;
        this.setState({
          innerValue: { ready: true },
        });
      } else {
        this.oldValue = value;
      }
    }
  }

  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer">
        <div
          ref="container"
          style={this.containerStyle}
          className={classnames(
            (!this.state.innerValue || !this.state.innerValue.ready) && "hide"
          )}
        />
        {validationResult && (
          <div className="errorMessage">
            {this.s(validationResult.stringId)}
          </div>
        )}
      </div>
    );
  }
}

export const Value = ImageComponent;

export class Display extends ImageComponent {}
