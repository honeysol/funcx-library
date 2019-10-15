import React from "react";
import classnames from "classnames";
import crypto from "crypto";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from "react-sortable-hoc";
import update from "immutability-helper";

import { FuncxComponent } from "../core.js";

const SortableContainerWithOptions = options => target =>
  SortableContainer(target, options);

@SortableHandle
class DragHandle extends React.Component {
  render() {
    return <div className="grabber" />;
  }
}

@SortableElement
class SchemaItem extends FuncxComponent {
  onUpdateValue(value) {
    this.setValue(value);
  }
  render() {
    const Component = this.getComponent(this.props.params);
    return (
      <div className="schemaItem">
        <span className="itemHeader">
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon"
            onClick={this.props.itemRemove}
          >
            <span className="icon-close" />
          </button>
          <button
            type="button"
            tabIndex="-1"
            className="buttonIcon"
            onClick={this.props.itemInsert}
          >
            <span className="icon-plus" />
          </button>
          <DragHandle />
        </span>
        <Component
          value={this.state.value}
          onUpdateValue={this.onUpdateValue}
          params={this.props.params}
          system={this.props.system}
          context={this.props.context}
        />
      </div>
    );
  }
}

@SortableContainerWithOptions({ withRef: true })
class SortableList extends FuncxComponent {
  onUpdateValue(value, index) {
    this.setValue(
      update(this.state.value, {
        $splice: [[index, 1, value]],
      })
    );
  }
  itemRemove(index) {
    this.setValue(
      update(this.state.value, {
        $splice: [[index, 1]],
      })
    );
  }
  itemInsert(index) {
    const defaultValue =
      this.props.params.defaultValue === undefined
        ? null
        : this.props.params.defaultValue;
    this.setValue(
      update(this.state.value || [], {
        $splice: [
          [
            index,
            0,
            this.props.params.useId
              ? {
                  ...defaultValue,
                  itemId: crypto.randomBytes(8).toString("hex"),
                }
              : defaultValue,
          ],
        ],
      })
    );
  }
  render() {
    const length = (this.state.value && this.state.value.length) || 0;
    return (
      <div className={classnames(this.props.params.className)}>
        {this.state.value?.map((value, index) => (
          <SchemaItem
            key={`item-${index}`}
            index={index}
            params={this.props.params.items}
            value={value}
            onUpdateValue={_value => this.onUpdateValue(_value, index)}
            itemRemove={() => this.itemRemove(index)}
            itemInsert={() => this.itemInsert(index)}
            system={this.props.system}
            context={{
              ...this.props.context,
              index,
              position: [
                ...(this.props.context.position || []),
                this.props.params.useId ? { itemId: value.itemId } : index,
              ],
            }}
          />
        ))}
        <button
          type="button"
          tabIndex="-1"
          className="buttonIcon arrayFooter"
          onClick={() => this.itemInsert(length)}
        >
          <span className="icon-plus" />
        </button>
      </div>
    );
  }
}

class ArrayValue extends FuncxComponent {
  onUpdateValue(value) {
    this.setValue(value);
  }
  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      this.setValue(arrayMove(this.state.value, oldIndex, newIndex));
    }
  };
  onSortStart = ({ node, index, collection }, event) => {
    console.log(node, index, collection, event);
  };
  render() {
    return (
      <SortableList
        params={this.props.params}
        value={this.state.value}
        onSortStart={this.onSortStart}
        onSortEnd={this.onSortEnd}
        onUpdateValue={this.onUpdateValue}
        useDragHandle={true}
        helperClass="dragging"
        system={this.props.system}
        context={this.props.context}
      />
    );
  }
}

class ArrayDisplay extends FuncxComponent {
  render() {
    const Component = this.getComponent(this.props.params.items);
    const context = this.getContext();
    if (this.state.value && !Array.isArray(this.state.value)) {
      console.log(this.state.value);
      console.error("value is not array");
      return <div />;
    }
    return (
      <div className={classnames(this.props.params.className, "schemaArray")}>
        {this.state.value?.map((value, index) => (
          <div className={classnames("schemaItem")} key={`item-${index}`}>
            <Component
              index={index}
              params={this.props.params.items}
              value={value}
              onUpdateValue={() => {}}
              system={this.props.system}
              context={{
                ...context,
                index,
                position: [...(context.position || []), index],
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}

export const Value = ArrayValue;
export const Display = ArrayDisplay;
