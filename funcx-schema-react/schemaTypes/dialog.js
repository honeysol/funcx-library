import React from "react";
import * as validators from "../validators";
import { FuncxComponent } from "../core.js";
import classnames from "classnames";

class ModalFrame extends FuncxComponent {
  modalShouldBeClosed(withSave = false) {
    this.refs.panel.panelShouldBeClosed();
  }
  render() {
    const Component = this.props.system.components[this.props.params.panel];
    return (
      <div>
        <div className="modalCloseButton hideOnMobile">
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon"
            onClick={() => this.modalShouldBeClosed()}
          >
            <span className="icon-close" />
          </button>
        </div>
        <div className="modalContent">
          <Component
            system={this.props.system}
            context={this.props.context}
            ref="panel"
            onClosed={this.props.closeModal}
            value={this.props.value}
            onUpdateValue={this.props.onUpdateValue}
            params={this.state.params}
            showCloseButton={true}
          />
        </div>
      </div>
    );
  }
}

class DialogValue extends FuncxComponent {
  validators = [validators.required];
  onUpdateValue(value) {
    this.setValue(value);
  }
  open = () => {
    if (this.state.params.action) {
      this.state.params.action(this.props);
    } else if (this.state.params.schema) {
      this.props.system.modalService.addModal({
        render: (closeModal, index) => {
          const element = (
            <ModalFrame
              system={this.props.system}
              context={{
                title: this.state.params.title,
              }}
              ref="content"
              closeModal={reponse => closeModal(reponse)}
              index={index}
              value={this.getValue()}
              onUpdateValue={this.onUpdateValue}
              params={this.state.params}
            />
          );
          return element;
        },
        className: this.state.params.className,
      });
    }
    this.onFocus();
    this.onBlur();
  };
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    const DisplayComponent =
      this.state.params.displaySchema &&
      this.getComponent(this.state.params.displaySchema);

    if (DisplayComponent) {
      return (
        <div
          className={classnames(
            "schemaValueContainer",
            this.state.params.openerClassName
          )}
        >
          <div className="schemaValue schemaValueDialog" onClick={this.open}>
            <DisplayComponent
              params={this.state.params.displaySchema}
              value={this.props.value}
              onUpdateValue={this.props.onUpdateValue}
              system={this.props.system}
              context={this.props.context}
            />
          </div>
          {validationResult && (
            <div className="errorMessage">
              {validationResult && validationResult.message}
            </div>
          )}
        </div>
      );
    } else if (this.state.params.buttonDialog) {
      return (
        <div className={classnames("schemaValueContainer buttonDialog")}>
          <div className="schemaValue schemaValueDialog" onClick={this.open}>
            <button
              type="button"
              tabIndex="-1"
              className="buttonIcon dialogButton"
            >
              <span
                className={
                  this.state.params.buttonClassName || "icon-arrow-right"
                }
              />
              <span className="schemaValueDisplay">
                {this.state.params.display(this.state.value)}
              </span>
            </button>
          </div>
          {validationResult && (
            <div className="errorMessage">
              {validationResult && validationResult.message}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          className={classnames(
            "schemaValueContainer",
            this.state.params.openerClassName
          )}
        >
          <div className="schemaValue schemaValueDialog" onClick={this.open}>
            <span className="schemaValueDisplay">
              {this.state.params.display(this.state.value)}
            </span>
            <button
              type="button"
              tabIndex="-1"
              className="buttonIcon dialogButton"
            >
              <span
                className={
                  this.state.params.buttonClassName || "icon-arrow-right"
                }
              />
            </button>
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
}

export const Value = DialogValue;
