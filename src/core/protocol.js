/*
 * The µHome in it's first status is pretty simple. It contains a header and payload.
 * The header is 5 bytes in size and will contain 3 unsigned integers. First Integer describes the version of the protocol,
 * the other integer is the content size
 *
 * Payload by definition has to be a JSON string. In v2 it is even required to be a CloudEvent Object
 *
 *         -------------------------------------------------------------------------------------------
 * Name    |    HEADER|SIZE |   HEADER|VERSION    |     HEADER|STATUS     |         PAYLOAD          |
 * Size    |    2 Bytes     |       2 Bytes       |       1 Byte          |         12 Bytes         |
 * Content |    12          |          1          |         1             |      "Hello World\n"     |
 *         -------------------------------------------------------------------------------------------
 * Status Code Table
 * 0: Server Error occurred
 * 1: Ok
 * 2: Send Data is invalid
 */

import { isArray, isPlainObject, isString } from 'lodash';
import { v4 as uuid } from 'uuid';
import { isJson, isMicroHomeEvent } from '../utils/validate';
import log from '../utils/logger';

const defaultLogger = log.child({ service: 'µHomeProtocol' });
export const LATEST_VERSION = 2;

const fillHeader = (payloadLength, version, status, buffer = Buffer.alloc(5)) =>
  buffer.writeUInt16BE(payloadLength) &&
  buffer.writeUInt16BE(version, 2) &&
  buffer.writeUInt8(status, 4) &&
  buffer;

export const createPackage = (payloadBuffer, version, status) =>
  Buffer.concat([
    fillHeader(payloadBuffer.length, version, status),
    payloadBuffer,
  ]);

export const microHomeMessageV1 = (payload, status, logger) => {
  if (!isArray(payload) && !isPlainObject(payload) && !isString(payload)) {
    throw new Error('Payload can only be an array, object or string.');
  }

  const strPayload =
    typeof payload !== 'string' ? JSON.stringify(payload) : payload;

  if (!isJson(strPayload)) {
    throw new Error('Payload is no valid JSON string.');
  }

  logger.debug('Creating Buffer with payload', { payload: strPayload });
  return createPackage(Buffer.from(strPayload), 1, status);
};

export const microHomeMessageV2 = (payload, status, logger) => {
  if (!isPlainObject(payload)) {
    throw new Error('Payload can only be of type object.');
  }

  if (!isMicroHomeEvent(payload)) {
    throw new Error(
      'Payload does not contain every required µHomeEvent properties.',
    );
  }

  logger.debug('Creating Buffer with payload', {
    payload: JSON.stringify(payload),
  });
  return createPackage(Buffer.from(JSON.stringify(payload)), 2, status);
};

// Function to create a µHome protocol message
export const microHomeMessage = (
  payload,
  status = 1,
  version = LATEST_VERSION,
  logger = defaultLogger,
) => {
  switch (version) {
    case 1:
      return microHomeMessageV1(payload, status, logger);
    case 2:
      return microHomeMessageV2(payload, status, logger);
    default:
      // Use latest version
      return microHomeMessageV2(payload, status, logger);
  }
};

export const createPayload = (
  { source, type, data, error },
  timestamp = new Date().toISOString(),
) => ({
  id: uuid(),
  timestamp,
  source,
  type,
  data,
  error,
});

// Function to parse a µHome protocol message
export const parseMicroHomeMessage = buffer => {
  // Read Header
  const [contentLength, version, status] = [
    buffer.readUInt16BE(),
    buffer.readUInt16BE(2),
    buffer.readInt8(4),
  ];
  // Read Payload
  const payload = JSON.parse(buffer.toString('utf8', 5, contentLength + 5));

  return {
    contentLength,
    version,
    status,
    payload,
  };
};
