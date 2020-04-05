/* eslint-disable max-classes-per-file */

export class NetworkError extends Error {
  constructor(message, response = null) {
    super(message);
    this.response = response;
  }
}

export class NoOpError extends Error {
  constructor(message) {
    super(message);
    this.noop = null;
  }
}
