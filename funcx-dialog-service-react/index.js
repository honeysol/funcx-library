/**
Example: 
  dialogService.openActionSheet({
    title: "This is Test",
    message: "Test Message",
    options: [
      {
        title: "OK",
        value: true,
        destructive: true,
        primal: true,
      },
      {
        title: "Cancel",
        value: false,
      },
    ],
  })
*/

import React from "react";
import classnames from "classnames";
import "./dialogService.scss";
import "./onsenui-module.scss";

class OnsenAlertDialog extends React.Component {
  modalShouldBeClosed(result) {
    this.props.closeModal(result);
  }
  render() {
    return (
      <div className="onsenuiModule">
        <div className="alert-dialog">
          <div className="alert-dialog-container">
            <div className="alert-dialog-title">{this.props.params.title}</div>
            <div className="alert-dialog-content">
              {this.props.params.message}
            </div>
            <div className="alert-dialog-footer">
              {this.props.params.options.map(option => (
                <button
                  type="button"
                  onClick={() => this.modalShouldBeClosed(option.value)}
                  className={classnames(
                    "alert-dialog-button",
                    option.primal && "alert-dialog-button--primal "
                  )}
                  key={option.value}
                >
                  {option.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
class OnsenAlertDialogRow extends React.Component {
  modalShouldBeClosed(result) {
    this.props.closeModal(result);
  }
  render() {
    return (
      <div className="onsenuiModule">
        <div className="alert-dialog">
          <div className="alert-dialog-container">
            <div className="alert-dialog-title">{this.props.params.title}</div>
            <div className="alert-dialog-content">
              {this.props.params.message}
            </div>
            <div className="alert-dialog-footer alert-dialog-footer--rowfooter">
              {this.props.params.options.map(option => (
                <button
                  type="button"
                  onClick={() => this.modalShouldBeClosed(option.value)}
                  className={classnames(
                    "alert-dialog-button",
                    "alert-dialog-button--rowfooter",
                    option.primal && "alert-dialog-button--primal "
                  )}
                  key={option.value}
                >
                  {option.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
class OnsenDownloadDialog extends React.Component {
  modalShouldBeClosed(result) {
    this.props.closeModal(result);
  }
  render() {
    return (
      <div className="onsenuiModule">
        <div className="alert-dialog">
          <div className="alert-dialog-container">
            <div className="alert-dialog-title">{this.props.params.title}</div>
            <div className="alert-dialog-content">
              {this.props.params.message}
            </div>
            <div className="alert-dialog-footer">
              {this.props.params.options.map(option => (
                <a
                  href={option.url}
                  download={option.filename}
                  onClick={() => this.modalShouldBeClosed(option.value)}
                  className={classnames(
                    "alert-dialog-button",
                    option.primal && "alert-dialog-button--primal "
                  )}
                  key={option.value}
                >
                  <span>{option.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
class OnsenActionSheet extends React.Component {
  modalShouldBeClosed(result) {
    this.props.closeModal(result);
  }
  render() {
    return (
      <div className="onsenuiModule">
        <div className="action-sheet">
          <div className="action-sheet-title">{this.props.params.title}</div>
          {this.props.params.options.map(option => (
            <button
              type="button"
              onClick={() => this.modalShouldBeClosed(option.value)}
              className={classnames(
                "action-sheet-button",
                option.destructive && "action-sheet-button--destructive"
              )}
              key={option.value}
            >
              {option.title}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export class DialogService {
  constructor(modalService) {
    this.modalService = modalService;
  }
  openDialog(Component, params, callback = null) {
    if (callback === null) {
      return new Promise((fulfilled, rejected) => {
        this.openDialog(Component, params, response => {
          fulfilled(response);
        });
      });
    }
    this.modalService.addModal({
      expand: true,
      render: (closeModal, index) => {
        const element = (
          <Component closeModal={closeModal} ref="content" params={params} />
        );
        return element;
      },
      onClose: response => {
        callback(response);
      },
    });
    return null;
  }
  download({ title, message, url, blob, filename }) {
    const downloadURL = blob ? URL.createObjectURL(blob) : url;
    return this.openDownloadDialog({
      title: title,
      message: message,
      options: [
        {
          title: "OK",
          url: downloadURL,
          filename,
          value: true,
          primal: true,
        },
      ],
    }).then(response => {
      if (blob) {
        setTimeout(() => {
          URL.revokeObjectURL(downloadURL);
        }, 100);
      }
      return response;
    });
  }
  alert({ title, message }) {
    return this.openAlertDialog({
      title: title,
      message: message,
      options: [
        {
          title: "OK",
          value: true,
          primal: true,
        },
      ],
    });
  }
  confirm({ title, message }) {
    return this.openAlertDialog({
      title: title,
      message: message,
      options: [
        {
          title: "Cancel",
          value: false,
          primal: true,
        },
        {
          title: "OK",
          value: true,
        },
      ],
    });
  }
  confirmSave({ title, message }) {
    return this.openAlertDialog({
      title: title,
      message: message,
      options: [
        {
          title: "Cancel",
          value: false,
          primal: true,
        },
        {
          title: "Discard",
          value: "discard",
        },
        {
          title: "Save",
          value: "save",
        },
      ],
    });
  }
  openAlertDialog(params) {
    return this.openDialog(
      params.vertical ? OnsenAlertDialog : OnsenAlertDialogRow,
      params
    ).then(response => {
      console.log(response);
      return response;
    });
  }
  openActionSheet(params) {
    return this.openDialog(OnsenActionSheet, params).then(response => {
      console.log(response);
      return response;
    });
  }
  openDownloadDialog(params) {
    return this.openDialog(OnsenDownloadDialog, params).then(response => {
      console.log(response);
      return response;
    });
  }
}
