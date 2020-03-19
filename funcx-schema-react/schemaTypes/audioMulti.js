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
  get blobs() {
    return this.value?.map(value => {
      if (typeof value === "string") {
        return value;
      } else {
        return this.props.system.fileResource
          .fetchSession({
            id: value.id,
          })
          .getContent();
      }
    });
  }
  @computed
  get objectURLs() {
    return this.updateCurrentObjectURL(this.blobs);
  }
  updateCurrentObjectURL(blobs) {
    if (this._objectURLs) {
      for (const objectURL of this._objectURLs) {
        URL.revokeObjectURL(objectURL);
      }
    }
    this._objectURLs = [];
    return blobs?.map(blob => {
      if (!blob || typeof blob === "string") {
        return blob;
      } else {
        const objectURL = URL.createObjectURL(blob);
        this._objectURLs.push(objectURL);
        return objectURL;
      }
    });
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
    return this.value?.[0]?.duration;
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
            {this.objectURLs?.map((objectURL, index) => {
              return (
                <audio
                  style={{ display: "none" }}
                  controls
                  key={index}
                  src={objectURL}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  cancelers = [];

  onTimeUpdate = () => {
    const audio = this.audioContainerRef.current.children[0];
    this.currentTime = audio.currentTime;
  };
  onEnded = () => {
    this.playing = false;
    this.currentTime = 0;
  };

  componentDidMount() {
    this.componentDidMountOrUpdate();
  }
  componentDidUpdate() {
    this.componentDidMountOrUpdate();
  }
  componentDidMountOrUpdate() {
    while (this.cancelers.length) {
      this.cancelers.shift().canceler?.();
    }
    const audio = this.audioContainerRef.current.children[0];
    if (audio) {
      console.log("audio", audio);
      audio.addEventListener("timeupdate", this.onTimeUpdate);
      audio.addEventListener("ended", this.onEnded);
      this.cancelers.push(() =>
        audio.removeEventListener("timeupdate", this.onTimeUpdate)
      );
      this.cancelers.push(() =>
        audio.removeEventListener("ended", this.onEnded)
      );
    }
  }
}

export const Value = AudioComponent;

export const Display = AudioComponent;
