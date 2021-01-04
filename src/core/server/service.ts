import net from 'net';
import { EventEmitter } from 'events';
import { create as createLogger } from '../../utils/logger';
import { fromBuffer } from './rpc-messages';
import { send, error } from './response';
import {
  JsonRpcNotification,
  JsonRpcRequest,
  ServiceEventHandler,
  ServiceInstance,
  ServiceOptions,
  ServiceResponse,
} from '../../types';
import { pipe } from 'fp-ts/lib/function';

// The return value defines the interface the user is handling
const rpcEventParameter = (socket: net.Socket) => (
  request: JsonRpcRequest | JsonRpcNotification,
): {
  request: JsonRpcRequest | JsonRpcNotification;
  response: ServiceResponse;
} => ({
  request,
  response: {
    send: send(socket)((request as JsonRpcRequest).id), // Rejects if request is a JsonRpcNotification
    error: error(socket)((request as JsonRpcRequest).id), // Rejects if request is a JsonRpcNotification
  },
});

const jsonRpcHandler = (socket: net.Socket) => (eventEmitter: EventEmitter) => (
  data: Buffer,
): void => {
  // TODO: Validate Data on simple JSON-RPC protocol schema. io-ts?
  const request: JsonRpcRequest | JsonRpcNotification = fromBuffer(data);
  eventEmitter.emit(request.method, rpcEventParameter(socket)(request));
};

/**
 * Used to create a service instance, which can be used to listen for JSON-RPC messages.
 * Includes a logger instance.
 * @param options
 */
export const create = (options: ServiceOptions): ServiceInstance => {
  const instanceEventEmitter = new EventEmitter();
  const instanceLogger = createLogger(
    'name' in options ? options.name : 'Default ServiceInstance',
  );
  const instanceServer = net.createServer(socket =>
    socket.on('data', jsonRpcHandler(socket)(instanceEventEmitter)),
  );

  instanceLogger.info('Creating Server...');

  return pipe(
    {
      eventEmitter: instanceEventEmitter,
      logger: instanceLogger,
      server: instanceServer,
    },
    register('µHome.healthcheck')(({ response }) =>
      response.send({ healthy: true }),
    ),
  );
};

/**
 * Used to register event handler for incoming JSON-RPC events.
 * @param method JSON-RPC method name
 * @param handler Handler function for the event, will be called with `{request, response}`
 */
export const register = (method: string) => <T>(
  handler: ServiceEventHandler<T>,
) => (service: ServiceInstance): ServiceInstance => {
  // TODO: Check if a handler doesn't already exist ... Only one handler per event
  service.eventEmitter.on(method, handler);
  return service;
};

/**
 * Listen for incoming events on specified port.
 * @param port
 */
export const listen = (port: string | number) => (
  service: ServiceInstance,
): ServiceInstance => {
  service.server.listen(port);
  return service;
};
