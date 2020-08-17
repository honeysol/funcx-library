import React from "react";
import ReactDOM from "react-dom";
import * as validators from "../validators";
import { InputComponent } from "../core.js";
import classnames from "classnames";
import { AsyncCommitter } from "async-committer";

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

export class Value extends InputComponent {
  validators = [validators.required, validators.uploading];
  asyncCommitter = new AsyncCommitter();
  onChange = (e: any) => {
    const file = e.target.files[0];
    this.setState({
      validationSuppressed: false,
    });
    (async () => {
      const { successed, value } = await this.asyncCommitter.run(async () => {
        // validationの更新のみ行う
        this.setValue(this.state.value, true, true);
        const session = await this.props.system.fileResource.uploadSession(
          file
        );
        session.on("progress", (progressParams) => {
          const progress =
            progressParams.progress !== null
              ? progressParams.progress * 100
              : null;
          this.setState({
            innerValue: {
              progress,
            },
          });
        });
        const params = await session.getParams();
        this.setValue(params);
        await session.onUploaded();
        return null;
      });
      if (successed) {
        // validationの更新のみ行う
        this.setValue(this.state.value, true, true);
      }
    })();
  };
  isUploading() {
    return this.asyncCommitter.isRunning();
  }
  remove = () => {
    ReactDOM.findDOMNode(this.refs.fileInput).value = null;
    this.setValue(null);
  };
  download = async () => {
    const key = this.state.value && this.state.value.id;
    if (key) {
      const session = this.props.system.fileResource.fetchSession(
        {
          id: key,
        },
        { original: true }
      );
      session.on("progress", (progressParams) => {
        this.setState({
          innerValue: { progress: progressParams.progress * 100 },
        });
      });
      const blob = await session.getContent();
      await this.props.system.dialogService.download({
        title: "Download",
        message: this.state.value.filename,
        blob: blob,
        filename: this.state.value.filename,
      });
    }
  };

  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    const Component = this.getComponent(this.props.params.schema, {
      defaultComponent: DisplayFilename,
    });
    const progress = this.state.innerValue && this.state.innerValue.progress;
    const progressWidth = progress != null ? progress.toFixed(2) + "%" : null;
    return (
      <div className="schemaValueContainer">
        <div
          className="schemaValue"
          style={{
            position: "relative",
            flex: this.state.value ? "none" : null,
          }}
        >
          <div className="progressBarContainer">
            <div className={classnames(!progress && "hide")}>
              <div
                className="progress-bar__primary"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
          <Component
            value={this.state.value}
            onUpdateValue={this.onUpdateValue}
            params={this.props.params.schema}
            system={this.props.system}
            context={this.props.context}
          />
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon actionButton"
            onClick={this.download}
            style={{
              display: !this.state.value ? "none" : null,
            }}
          >
            <span className="fa fa-cloud-download " />
          </button>
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon actionButton"
            onClick={this.remove}
            style={{
              display: !this.state.value ? "none" : null,
            }}
          >
            <span className="fa fa-trash-o" />
          </button>
          <div
            className="schemaValueDropArea"
            style={{
              display: this.state.value ? "none" : null,
            }}
          >
            <div className="schemaValueDropInner">
              <button
                type="button"
                tabIndex="-1"
                className="buttonIcon buttonCentered"
              >
                <span className="fa fa-cloud-upload" />
              </button>
            </div>
          </div>
          <input
            className="schemaValueTransparentArea"
            style={{
              display: this.state.value ? "none" : null,
            }}
            type="file"
            ref="fileInput"
            onChange={this.onChange}
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

export class Display extends Value {
  render() {
    const Component = this.getComponent(this.props.params.schema, {
      defaultComponent: DisplayFilename,
    });
    const progress = this.state.innerValue && this.state.innerValue.progress;
    const progressWidth = progress != null ? progress.toFixed(2) + "%" : null;
    return (
      <div className="schemaValueContainer">
        <div
          className="schemaValue"
          style={{
            position: "relative",
            flex: this.state.value ? "none" : null,
          }}
        >
          <div className="progressBarContainer">
            <div className={classnames(!progress && "hide")}>
              <div
                className="progress-bar__primary"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
          <Component
            value={this.state.value}
            onUpdateValue={this.onUpdateValue}
            params={this.props.params.schema}
            system={this.props.system}
            context={this.props.context}
          />
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon actionButton"
            onClick={this.download}
            style={{
              display: !this.state.value ? "none" : null,
            }}
          >
            <span className="fa fa-cloud-download " />
          </button>
        </div>
      </div>
    );
  }
}
