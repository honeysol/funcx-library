// @flow

import EventEmitter from "events";

export class ValidationAccessor {
  validationHelper: ValidationHelper;
  validationId: number;
  options: any;
  validationEnabled = false;
  constructor(
    validationHelper: ValidationHelper,
    validationId: number,
    options: any
  ) {
    this.validationHelper = validationHelper;
    this.validationId = validationId;
    this.options = options;
  }
  update(validation: any) {
    this.validationHelper.updateValidation(this.validationId, validation);
  }
  onValidationEnabled() {
    if (!this.validationEnabled) {
      this.validationEnabled = true;
      this.options.onValidationEnabled();
    }
  }
  unregister() {
    return null;
  }
  focus() {
    this.validationHelper.focus(this.validationId);
  }
}

export class ValidationHelper {
  emitter = new EventEmitter();
  maxValidationId = 0;
  validations = {};
  validationCount: number = 0;
  suppressableValidationCount: number = 0;
  accessors: any = {};
  maxFocusedId = 0;
  constructor(callback: any) {
    this.emitter.on("validationChange", callback);
  }
  register(options: any = {}) {
    this.maxValidationId += 1;
    const validationId = this.maxValidationId;
    const accessor = new ValidationAccessor(this, validationId, options);
    this.accessors[validationId] = accessor;
    return accessor;
  }
  destroy() {
    this.emitter.removeAllListeners();
  }
  updateValidation(validationId: number, validation: any) {
    if (this.validations[validationId]) {
      this.validationCount -= 1;
      if (this.validations[validationId].suppressable) {
        this.suppressableValidationCount -= 1;
      }
    }
    if (validation) {
      this.validationCount += 1;
      if (validation.suppressable) {
        this.suppressableValidationCount += 1;
      }
      this.validations[validationId] = validation;
    } else {
      delete this.validations[validationId];
    }
    this.emitter.emit("validationChange", this.validations);
  }
  recalculateValidation() {
    this.validationCount = 0;
    this.suppressableValidationCount = 0;
    for(const validation of Object.values(this.validations)) {
      if(validation.validationResult) {
        this.validationCount += 1;
      }
    }
  }
  unsuppressAll() {
    this.focus(this.maxValidationId + 1);
  }
  focus(validationId: number) {
    while (this.maxFocusedId < validationId) {
      const accessor = this.accessors[this.maxFocusedId];
      if (accessor) {
        accessor.onValidationEnabled();
      }
      this.maxFocusedId += 1;
    }
  }
  passed() {
    return this.validationCount === 0;
  }
}
