import { Socket } from 'net';
import {
  JsonRpcError,
  JsonRpcErrorResponse,
  JsonRpcSuccessResponse,
} from '../../types';
import {
  asBuffer,
  rpcResponse,
  rpcError as responseError,
} from './rpc-messages';

// Utils of the "response" object the user is handling.

/**
 * `send` is used to respond to an incoming JSON-RPC request.
 *
 * @example
 * register('rpc-method', ({request, response}) => response.send({data: true}))
 */
export const send = (socket: Socket) => (requestId?: string) => <T>(
  responseData: T,
): Promise<JsonRpcSuccessResponse<T>> =>
  new Promise((resolve, reject) => {
    if (!requestId) {
      // If the request did not include an id, it was an notification.
      reject(new Error('Notifications are not allowed to respond to requests'));
    }

    const res = rpcResponse(requestId, responseData);
    socket.write(asBuffer(res), err => (err ? reject(err) : resolve(res)));
  });

/**
 * `error` is used to respond to an incoming JSON-RPC request with an error.
 *
 * @example
 * register('rpc-method', ({request, response}) => response.error({error: true}))
 */
export const error = (socket: Socket) => (requestId?: string) => <T>(
  errorData: JsonRpcError<T>,
): Promise<JsonRpcErrorResponse<T>> =>
  new Promise((resolve, reject) => {
    // If the request did not include an id, it was an notification.
    if (!requestId) {
      reject(new Error('Notifications are not allowed to respond to requests'));
    }

    const res = responseError<T>(requestId, errorData);
    socket.write(asBuffer(res), err => (err ? reject(err) : resolve(res)));
  });
