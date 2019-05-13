import React from "react";
import * as validators from "../validators";
import { InputComponent } from "../core.js";
import sanitizeHtml from "sanitize-html";

export class Value extends InputComponent {
  validators = [validators.required];
  render() {
    const validationResult = this.getDisplayValidationResult(this.state);
    return (
      <div className="schemaValueContainer" style={{ height: "80px" }}>
        <div className="schemaValue">
          <textarea
            type="text"
            value={this.state.value || ""}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
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
    const text = this.props.value || "";

    const sanitizedContent = sanitizeHtml(
      text.replace(/https?:\/\/[\w/:%#$&?()~.=+-]+/g, '<a href="$&">$&</a>'),
      {
        transformTags: {
          a: (tagName, attribs) => {
            return {
              tagName: tagName,
              attribs: {
                target: "_blank",
                href: attribs.href,
              },
            };
          },
        },
      }
    );
    return (
      <pre
        style={{
          padding: "10px",
          fontSize: "16px",
          margin: 0,
        }}
        className="schemaValue"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }
}
