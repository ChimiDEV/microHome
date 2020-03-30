/*
 * The µHome in it's first state is pretty simple. It contains a header and payload.
 * The header is 4 bytes in size and will contain 2 unsigned integers. one describes the version of the protocl,
 * the other integer is the content size
 *
 * Payload by definition has to be a JSON string. In v2 it is even required to be a CloudEvent Object
 *
 *         ------------------------------------------------------------------
 * Name    |    HEADER|SIZE |   HEADER|VERSION    |         PAYLOAD         |
 * Size    |    2 Bytes     |       2 Bytes       |        12 Bytes         |
 * Content |    12          |          1          |     "Hello World\n"     |
 *         ------------------------------------------------------------------
 */

import { isArray, isPlainObject, isString } from 'lodash';
import { v4 as uuid } from 'uuid';
import { isJson, isMicroHomeEvent } from '../utils/validate';
import log from '../utils/logger';

const defaultLogger = log.child({ service: 'µHomeProtocol' });

const fillHeader = (payloadLength, version, buffer = Buffer.alloc(4)) =>
  buffer.writeUInt16BE(payloadLength) &&
  buffer.writeUInt16BE(version, 2) &&
  buffer;

export const createPackage = (payloadBuffer, version) =>
  Buffer.concat([fillHeader(payloadBuffer.length, version), payloadBuffer]);

export const microHomeMessageV1 = (payload, logger) => {
  if (!isArray(payload) && !isPlainObject(payload) && !isString(payload)) {
    throw new Error('Payload can only be an array, object or string.');
  }

  const strPayload =
    typeof payload !== 'string' ? JSON.stringify(payload) : payload;

  if (!isJson(strPayload)) {
    throw new Error('Payload is no valid JSON string.');
  }

  logger.debug('Creating Buffer with payload', { payload: strPayload });
  return createPackage(Buffer.from(strPayload), 1);
};

export const microHomeMessageV2 = (payload, logger) => {
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
  return createPackage(Buffer.from(JSON.stringify(payload)), 2);
};

// Function to create a µHome protocol message
export const microHomeMessage = (payload, version, logger = defaultLogger) => {
  switch (version) {
    case 1:
      return microHomeMessageV1(payload, logger);
    case 2:
      return microHomeMessageV2(payload, logger);
    default:
      // Use latest version
      return microHomeMessageV2(payload, logger);
  }
};

export const createPayload = (
  { source, type, data },
  version = 2,
  timestamp = new Date().toISOString(),
) => ({
  id: uuid(),
  version,
  timestamp,
  source,
  type,
  data,
});

// Function to parse a µHome protocol message
export const parseMicroHomeMessage = buffer => {};
