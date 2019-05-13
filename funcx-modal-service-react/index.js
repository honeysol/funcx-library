import React from "react";
import ReactDOM from "react-dom";

import update from "immutability-helper";
import classnames from "classnames";
import "./modal.scss";

class Modal extends React.Component {
  render() {
    const content = this.props.config.render(
      this.props.closeModal,
      this.props.index
    );
    return (
      <div
        className={classnames("modalContainer", this.props.config.className)}
      >
        <div className="modalBackdrop" />
        <div className={this.props.config.expand ? "" : "modalMain"}>
          {content}
        </div>
      </div>
    );
  }
}

class Modals extends React.Component {
  constructor(props) {
    super(props);
    this.state = { list: [] };
  }
  componentWillMount() {
    this.props.callback(this);
  }
  addModal(config) {
    this.setState((prevState, props) =>
      update(prevState, {
        list: { $push: [config] },
      })
    );
  }
  getLastModalContent() {
    const modal = this.refs[this.state.list.length - 1];
    return modal && modal.refs.content;
  }
  closeModal(response, index) {
    if (this.state.list.length - 1 === index) {
      const config = this.state.list[index];
      if (config.onClose) {
        config.onClose(response);
      }
      this.setState((prevState, props) =>
        update(prevState, {
          list: { $splice: [[-1, 1]] },
        })
      );
    }
  }
  refList = [];
  render() {
    this.refList = [];
    return (
      <div className="modalList funcx">
        {this.state.list.map((config, index) => {
          return (
            <Modal
              key={index}
              index={index}
              config={config}
              closeModal={response => this.closeModal(response, index)}
              ref={index}
            />
          );
        })}
      </div>
    );
  }
}

export class ModalService {
  constructor(element) {
    if (element) {
      this.element = element;
    } else {
      const newElement = document.createElement("div");
      document.body.appendChild(newElement);
      this.element = newElement;
    }
    document.addEventListener("keydown", e => {
      if (e.keyCode === 27) {
        this.closeLastModal();
      }
    });
    this.draw();
  }
  addModal(config) {
    if (this.component) {
      this.component.addModal(config);
    } else {
      this.delayedModals.push(config);
    }
  }
  closeLastModal() {
    const modal = this.component.getLastModalContent();
    if (modal && modal.modalShouldBeClosed) {
      modal.modalShouldBeClosed();
    } else {
      console.log("modalShouldBeClosed not found", modal);
    }
  }
  setComponent = component => {
    this.component = component;
  };
  draw() {
    ReactDOM.render(
      <Modals callback={component => this.setComponent(component)} />,
      this.element
    );
  }
}
