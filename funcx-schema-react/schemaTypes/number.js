import React from "react";
import * as validators from "../validators";
import { InputComponent } from "../core.js";
import classnames from "classnames";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export class Value extends InputComponent {
  validators = [validators.required, validators.range];
  onUpdateValue(value) {
    this.setValue(value);
  }
  onChangeText(e) {
    const value = parseInt(e.target.value || 0, 10);
    this.setValue(parseInt(value, 10));
  }
  bound(_value) {
    let value = _value;
    if (this.state.params.max !== null && this.state.params.max !== undefined) {
      value = Math.min(this.state.params.max, value);
    }
    if (this.state.params.min !== null && this.state.params.min !== undefined) {
      value = Math.max(this.state.params.min, value);
    }
    return value;
  }
  boundRotate(value) {
    const min = this.state.params.min || 0;
    const max = this.state.params.max;
    if (max !== null || max !== undefined) {
      return ((value - min) % (max + 1 - min)) + min;
    } else {
      return value;
    }
  }
  step(direction) {
    this.togglePlay(false);
    this.setValue(
      this.bound(
        (this.state.value || 0) + direction * (this.state.params.step || 1)
      )
    );
  }
  largeStep(direction) {
    this.togglePlay(false);
    this.setValue(
      this.bound(
        (this.state.value || 0) + direction * (this.state.params.largeStep || 1)
      )
    );
  }
  rotate(direction) {
    this.setValue(
      this.boundRotate(
        (this.state.value || 0) + direction * (this.state.params.step || 1)
      )
    );
  }
  intervalHandler = null;
  togglePlay = newPlaying => {
    const currentPlaying = Boolean(this.intervalHandler);
    const playing = newPlaying === undefined ? !currentPlaying : newPlaying;

    if (playing !== currentPlaying) {
      if (playing) {
        if (this.intervalHandler) {
          debugger;
        }
        this.intervalHandler = setInterval(() => {
          this.rotate(1);
        }, 500);
      } else if (this.intervalHandler) {
        if (!this.intervalHandler) {
          debugger;
        }
        clearInterval(this.intervalHandler);
        this.intervalHandler = null;
      }
      this.setState(state => {
        return Object.assign({}, state, {
          innerValue: {
            playing: playing,
          },
        });
      });
    }
  };
  render() {
    const valueString =
      this.state.value !== undefined &&
      this.state.value !== null &&
      !isNaN(this.state.value)
        ? this.state.value + (this.state.params.offset || 0)
        : this.state.params.defaultString || "";
    const value = !isNaN(this.state.value) ? this.state.value : null;
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          <div className="schemaValueNumber">
            {(() => {
              if (this.state.params.disableInput) {
                return (
                  <span
                    className="schemaValueNumberString"
                    style={{
                      flex: "none",
                      alignSelf: "center",
                      padding: "0 10px",
                    }}
                  >
                    <span className="schemaValueNumberStringValue">
                      {valueString}
                    </span>
                    <span className="schemaValueNumberStringUnit">
                      {this.state.params.unitString}
                    </span>
                  </span>
                );
              } else {
                return (
                  <input
                    type="number"
                    value={valueString}
                    max={this.state.params.max}
                    min={this.state.params.min}
                    step={this.state.params.step}
                    onChange={this.onChangeText}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                  />
                );
              }
            })()}
            <button
              type="button"
              tabIndex="-1"
              className={classnames(
                "buttonIcon buttonIconInset",
                (!this.state.params.largeStep ||
                  this.state.params.showControl === false) &&
                  "hide"
              )}
              onClick={() => this.step(-1)}
            >
              <span className="fa fa-forward mirror" />
            </button>
            <button
              type="button"
              tabIndex="-1"
              className={classnames(
                "buttonIcon buttonIconInset",
                this.state.params.showControl === false && "hide"
              )}
              onClick={() => this.largeStep(-1)}
            >
              <span className="fa fa-play mirror" />
            </button>
            <Slider
              value={value || 0}
              max={this.state.params.max || 10}
              min={this.state.params.min}
              step={this.state.params.step}
              onChange={this.onUpdateValue}
            />
            <button
              type="button"
              tabIndex="-1"
              className={classnames(
                "buttonIcon buttonIconInset",
                this.state.params.showControl === false && "hide"
              )}
              onClick={() => this.largeStep(1)}
            >
              <span className="fa fa-play" />
            </button>
            <button
              type="button"
              tabIndex="-1"
              className={classnames(
                "buttonIcon buttonIconInset",
                (!this.state.params.largeStep ||
                  this.state.params.showControl === false) &&
                  "hide"
              )}
              onClick={() => this.step(1)}
            >
              <span className="fa fa-forward" />
            </button>
            <button
              type="button"
              tabIndex="-1"
              className={classnames(
                "buttonIcon buttonIconInset",
                !this.state.params.enablePlay && "hide"
              )}
              onClick={() => this.togglePlay()}
            >
              <span
                className={classnames(
                  "fa",
                  !(this.state.innerValue && this.state.innerValue.playing) &&
                    "fa-play-circle",
                  this.state.innerValue &&
                    this.state.innerValue.playing &&
                    "fa-pause-circle"
                )}
              />
            </button>
          </div>
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

export class Display extends React.Component {
  render() {
    return <div className="schemaValue">{this.props.value}</div>;
  }
}
