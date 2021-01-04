import { EventEmitter } from 'events';
import { Logger } from 'pino';
import { Server } from 'net';
import {
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcSuccessResponse,
  JsonRpcError,
  JsonRpcErrorResponse,
} from './json-rpc';

export type ServiceOptions = {
  name?: string;
  [key: string]: string | number | boolean;
};

/**
 * A Service instance represents a Net.Server that can listen on a port for any incoming TCP messages.\
 * Services require to receive JSON-RPC conform messages for correct handling.
 */
export type ServiceInstance = {
  eventEmitter: EventEmitter;
  logger: Logger;
  server: Server;
};

export type ServiceResponse = {
  send: <T>(responseData: T) => Promise<JsonRpcSuccessResponse<T>>;
  error: <T>(errorData: JsonRpcError<T>) => Promise<JsonRpcErrorResponse<T>>;
};

export type ServiceEventHandler<T = unknown> = ({
  request,
  response,
}: {
  request: JsonRpcRequest<T> | JsonRpcNotification<T>;
  response: ServiceResponse;
}) => void;
