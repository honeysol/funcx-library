import isEmail from "validator/lib/isEmail";
import * as axios from "axios";
import { setupCache } from "axios-cache-adapter";

const cache = setupCache({
  maxAge: 15 * 60 * 1000,
  key: req => {
    return req.url + req.params.host;
  },
  exclude: { query: false },
});
const emailDomainApi = axios.create({
  adapter: cache.adapter,
});

const checkRequired = value => {
  return value !== null && value !== undefined && value !== "";
};

const emailValidation = {
  stringId: "emailValidation",
};

export const email = function email(value, params) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "string" && isEmail(value)) {
    return null;
  } else {
    return emailValidation;
  }
};

const emailDomainValidation = {
  stringId: "emailDomainValidation",
};

export const emailDomain = function emailDomain(
  value,
  params,
  { system, context }
) {
  if (!checkRequired(value)) {
    return null;
  }
  const match = value.match(/@([^@]+)$/);
  if (match) {
    const domain = match[1];
    console.log();
    return emailDomainApi
      .get(system.settings.emailValidationEndpoint, {
        params: { host: domain },
      })
      .then(response => {
        if (response.data.status === "found") {
          return null;
        } else {
          return emailDomainValidation;
        }
      });
  }
  console.error();
  throw new Error();
};

const requiredValidation = {
  suppressable: true,
  stringId: "requiredValidation",
};

export const required = function required(value, params) {
  if (!params.required) {
    return null;
  } else if (checkRequired(value)) {
    return null;
  } else {
    return requiredValidation;
  }
};

const requireValueValidation = {
  suppressable: true,
  stringId: "requireValueValidation",
};

export const requireValue = function requireTrue(value, params) {
  if (!("requireValue" in params) || value === params.requireValue) {
    return null;
  } else {
    return requireValueValidation;
  }
};

const rangeValidation = {
  stringId: "rangeValidation",
};

export const range = function range(value, params) {
  if (!checkRequired(value)) {
    return null;
  } else if (
    (params.max === null || params.max === undefined || value <= params.max) &&
    (params.min === null || params.min === undefined || value >= params.min)
  ) {
    return null;
  } else {
    return rangeValidation;
  }
};

const patternValidation = {
  stringId: "patternValidation",
};

export const pattern = function range(value, params) {
  if (!checkRequired(value)) {
    return null;
  }
  if (params.pattern) {
    if (!new RegExp(params.pattern).test(value)) {
      return patternValidation;
    }
  }
};

const passwordMatchValidation = {
  stringId: "passwordMatchValidation",
};

export const passwordMatch = function range(value, params, { context }) {
  if (!checkRequired(value)) {
    return null;
  }
  if (params.equalsWith) {
    if (
      value !==
      (context.parent.value && context.parent.value[params.equalsWith])
    ) {
      return passwordMatchValidation;
    }
  }
};

const objectFillValidation = {
  suppressable: true,
  stringId: "objectFillValidation",
};

export const objectFill = function range(value, params, { context }) {
  if (!checkRequired(value)) {
    return null;
  }
  let status = params.required ? true : null;
  for (const property of params.properties) {
    const propertyValue = value[property.propertyName];
    const propertyStatus = checkRequired(propertyValue);
    if (status === null) {
      status = propertyStatus;
    } else if (status !== propertyStatus) {
      console.log("%", "not passed");
      return objectFillValidation;
    }
  }
  console.log("%", "passed");
  return null;
};

const uploadingValidation = {
  stringId: "uploadingValidation",
};

export const uploading = function uploading(
  value,
  params,
  { context, target }
) {
  if (target.isUploading()) {
    return uploadingValidation;
  } else {
    return null;
  }
};
