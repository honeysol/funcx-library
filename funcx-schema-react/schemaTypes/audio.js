import React from "react";
import classnames from "classnames";
import { asyncComputed } from "mobx-library/mobx-async-computed";
import { component, render, prop } from "mobx-library/mobx-react-component";
import { computed, observable } from "mobx";
import Slider from "rc-slider";

@component.pure
class AudioComponent extends React.Component {
  containerStyle = { padding: "10px" };
  @prop params;
  @computed.struct
  get value() {
    return this.props.value;
  }
  @asyncComputed
  get blob() {
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
    super.componentWillUnmount?.();
    this.updateCurrentObjectURL(null);
  }
  @observable
  currentTime = 0;
  @observable
  playing = false;
  @computed
  get duration() {
    return this.value?.duration;
  }
  audioContainerRef = React.createRef();

  play() {
    this.playing = true;
    Array.from(this.audioContainerRef.current.children).forEach(audio => {
      audio.play();
    });
  }
  pause() {
    this.playing = false;
    Array.from(this.audioContainerRef.current.children).forEach(audio => {
      audio.pause();
    });
  }
  onTimeChange = value => {
    Array.from(this.audioContainerRef.current.children).forEach(audio => {
      audio.currentTime = value;
    });
    this.currentTime = value;
  };

  @render
  get render() {
    return (
      <div
        style={{ width: "100%", display: "flex", "flex-direction": "column" }}
      >
        <div style={{ display: "flex", "align-items": "center" }}>
          {!this.playing && (
            <button
              className={classnames("toolboxIcon", false && "active")}
              onClick={() => this.play()}
            >
              <i className={"fas fa-play"} />
            </button>
          )}
          {this.playing && (
            <button
              className={classnames("toolboxIcon", false && "active")}
              onClick={() => this.pause()}
            >
              <i className={"fas fa-pause"} />
            </button>
          )}
          <div className="schemaValueNumber" style={{ flex: 1 }}>
            <Slider
              value={this.currentTime}
              max={this.duration}
              min={0}
              step={0.1}
              onChange={this.onTimeChange}
            />
          </div>
          {(this.currentTime || 0).toFixed(1)}/{(this.duration || 0).toFixed(1)}
          <div ref={this.audioContainerRef}>
            {[true].map((blob, index) => {
              return (
                <audio
                  style={{ display: "none" }}
                  controls
                  key={index}
                  src={this.objectURL}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  componentDidMount() {
    console.log("this.audioRefs", this.audioContainerRef);
    Array.from(this.audioContainerRef.current.children).forEach(audio => {
      audio.addEventListener("timeupdate", event => {
        this.currentTime = audio.currentTime;
      });
      audio.addEventListener("ended", event => {
        this.playing = false;
        this.currentTime = 0;
      });
    });
  }
}

export const Value = AudioComponent;

export const Display = AudioComponent;
