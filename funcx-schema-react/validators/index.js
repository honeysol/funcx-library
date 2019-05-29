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

const emailValidation = {
  message: "Invalid Email Address",
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
  message: "Mail server not found",
};

export const emailDomain = function emailDomain(
  value,
  params,
  { system, context }
) {
  if (value === null || value === undefined || value === "") {
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
  message: "Required",
  suppressable: true,
};

export const required = function required(value, params) {
  if (!params.required) {
    return null;
  } else if (value !== null && value !== undefined && value !== "") {
    return null;
  } else {
    return requiredValidation;
  }
};

const rangeValidation = {
  message: "Out of range",
};

export const range = function range(value, params) {
  if (value === null || value === undefined) {
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
  message: "Pattern not match",
};

export const pattern = function range(value, params) {
  if (params.pattern) {
    if (!new RegExp(params.pattern).test(value)) {
      return patternValidation;
    }
  }
};

const passwordMatchValidation = {
  message: "Password not match",
};

export const passwordMatch = function range(value, params, { context }) {
  if (params.equalsWith) {
    if (value !== context.parent.value[params.equalsWith]) {
      return passwordMatchValidation;
    }
  }
};
