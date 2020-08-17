// @flow

import React from "react";
import { ValidationAccessor } from "./validationHelper";
import _ from "lodash";

// Convert to AdHoc Promise in which "then" block is immediately executed if it is possible
const immediatePromise = function immediatePromise(result) {
  if (result && typeof result.then === "function") {
    return result;
  } else {
    return {
      then: (promisable: any) => {
        return immediatePromise(promisable(result));
      },
    };
  }
};

const findAsync = function findAsync(array, callback) {
  if (!array || !array.length) {
    return immediatePromise(null);
  }
  return immediatePromise(callback(array[0])).then((result) => {
    if (result) {
      return immediatePromise(result);
    } else {
      return findAsync(array.slice(1), callback);
    }
  });
};

const toArray = function toArray(arr) {
  if (Array.isArray(arr)) {
    return arr;
  } else {
    return [];
  }
};

export const getComponent = (
  schema: any,
  { defaultComponent, schemaTypes, context }: any = {}
) => {
  if (!schema || !schema.schemaType) {
    return defaultComponent || DammyComponent;
  }
  const schemaType =
    typeof schema.schemaType === "string"
      ? schemaTypes[schema.schemaType]
      : schema.schemaType;
  if (!schemaType) {
    return DammyComponent;
  } else if (schema.readOnly || (context && context.readOnly)) {
    return schemaType.Display || schemaType.Value;
  } else {
    return schemaType.Value;
  }
};

export class FuncxComponent extends React.Component<any, any> {
  validationRequestCounter = 0;
  validationCommitCounter = 0;
  validationResult: any;
  validators: [any];
  mountState: string;
  validationAccessor: ValidationAccessor;
  validationId: number;

  constructor(props: any) {
    super(props);
    if (this.onUpdateValue) {
      this.onUpdateValue = this.onUpdateValue.bind(this);
    }
    this.state = {
      value: this.calculateStateValue(this.props.value),
      validationSuppressed: props.params.suppressValidation,
      params: this.convertParams(props),
    };
    if (this.props.context && this.props.context.validationHelper) {
      this.validationAccessor = this.props.context.validationHelper.register({
        onValidationEnabled: this.onValidationEnabled,
      });
    }
  }
  onUpdateValue(value: any): void {}
  onFocus() {}
  onBlur() {}

  // wrap difference update
  isChanged() {
    if (this.props.params.difference) {
      return this.state.value && Object.keys(this.state.value).length > 0;
    } else {
      return this.state.value !== this.props.value;
    }
  }
  getValue(...args: any[]) {
    const stateValue = args.length > 0 ? args[0] : this.state.value;
    if (this.props.params.difference) {
      return Object.assign({}, this.props.value, stateValue);
    } else {
      return stateValue;
    }
  }
  calculateStateValue(propValue: any, stateValue: any = null) {
    if (this.props.params.difference) {
      return stateValue;
    } else {
      return propValue;
    }
  }

  onFocus = () => {
    this.validationAccessor?.focus();
  };
  onBlur = () => {
    this.setState({
      validationSuppressed: false,
    });
  };
  onValidationEnabled = () => {
    this.setState({
      validationSuppressed: false,
    });
  };
  convertParams(props: any) {
    if (props.params.inject) {
      return Object.assign({}, props.params, props.params.inject(props));
    } else {
      return props.params;
    }
  }
  componentWillReceiveProps(newProps: any) {
    if (
      (newProps.value !== this.props.value &&
        newProps.value !== this.state.value) ||
      newProps.params !== this.props.params
    ) {
      this.setValue(newProps.value, this.props.params.difference, true);
    }
    if (
      newProps.params !== this.props.params ||
      newProps.context !== this.props.context
    ) {
      this.setState({ params: this.convertParams(newProps) });
    }
  }
  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      nextProps.params !== this.props.params ||
      nextProps.context !== this.props.context ||
      (nextState == null) !== (this.state == null) ||
      (nextState && this.state && nextState.value !== this.state.value) ||
      nextState.validationResult !== this.state.validationResult ||
      nextState.validationSuppressed !== this.state.validatonSuppressed ||
      nextState.validationNotPassed !== this.state.validationNotPassed ||
      nextState.innerValue !== this.state.innerValue
    );
  }
  getDisplayValidationResult(state: any) {
    if (!state.validationResult) {
      return null;
    } else if (
      state.validationResult.suppressable &&
      state.validationSuppressed
    ) {
      return null;
    } else {
      return state.validationResult;
    }
  }
  componentWillMount() {
    this.setValue(this.state.value, this.props.params.difference, true);
  }
  componentWillUnmount() {
    this.validationAccessor && this.validationAccessor.unregister();
  }
  clear() {
    if (this.props.params.difference) {
      this.setState({ value: null });
    } else {
      this.setState({ value: this.props.value });
    }
  }
  setState(update, ...args) {
    super.setState(update, ...args);
  }
  // 1. update state value
  // 2. validate
  // 3. update parent value (props)
  // 4. update validation
  setValue(
    value: {},
    noUpdate: boolean = false,
    noParentUpdate: boolean = false
  ) {
    if (noUpdate) {
      this.setState({});
    } else {
      this.setState({
        value: value,
      });
    }
    if (!noParentUpdate) {
      this.updateParent(value);
    }
    this.validate(this.getValue(value)).then(
      (validationResult) => {
        this.setState({
          validationResult: validationResult,
        });
        this.updateValidation(validationResult);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  setInnerValue(params: any) {
    this.setState((oldState) => {
      return _.merge(_.cloneDeep(oldState), {
        innerValue: params,
      });
    });
  }
  updateParent(value: any) {
    if (this.props.onUpdateValue && this.props.value !== value) {
      this.props.onUpdateValue(value);
    }
  }
  updateValidation(validationResult: any) {
    if (this.validationAccessor && this.validationResult !== validationResult) {
      this.validationAccessor.update(validationResult);
    }
    this.validationResult = validationResult;
  }
  validate(value: any) {
    this.validationRequestCounter += 1;
    const validationRequestCounter = this.validationRequestCounter;
    return findAsync(
      [...toArray(this.validators), ...toArray(this.props.params.validators)],
      (validator) => {
        return validator(value, this.props.params, {
          context: this.props.context,
          system: this.props.system,
          target: this,
        });
      }
    ).then((validationResult) => {
      if (this.validationCommitCounter < validationRequestCounter) {
        this.validationCommitCounter = validationRequestCounter;
        return validationResult;
      } else {
        throw new Error("validationAsyncError");
      }
    });
  }
  oldContext: any;
  oldValue: any;
  calculatedContext: any;
  getContext() {
    const value = this.getValue();
    if (
      !this.oldContext ||
      this.props.context !== this.oldContext ||
      value !== this.oldValue
    ) {
      this.oldContext = this.props.context;
      this.oldValue = value;
      this.calculatedContext = Object.assign({}, this.props.context, {
        parent: {
          debug: this,
          value: value,
          parent: this.props.context.parent,
          onUpdateValue: this.onUpdateValue,
        },
        readOnly: this.props.context.readOnly || this.props.params.readOnly,
      });
    }
    return this.calculatedContext;
  }
  getComponent(
    schema: any,
    { defaultComponent, schemaTypes, context }: any = {}
  ) {
    return getComponent(schema, {
      defaultComponent,
      schemaTypes: this.props.system.schemaTypes || schemaTypes,
      context: context || this.getContext(),
    });
  }
  s(stringId) {
    return this.props.system.localization.s(stringId, this.props.context.lang);
  }
}

export class InputComponent extends FuncxComponent {
  onChange: any;
  onChange = (e: any) => {
    this.setState({
      validationSuppressed: false,
    });
    this.setValue(e.target.value);
  };
}

class DammyComponent extends React.Component<any, any> {
  render() {
    return (
      <div className="schemaValueContainer">
        <div className="schemaValue">
          <span className="schemaValueDisplay">Error</span>
        </div>
      </div>
    );
  }
}
