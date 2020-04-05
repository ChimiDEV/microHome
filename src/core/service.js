/*
 * This represents the base of every node.
 * A node will create a tcp server with a listener on specified port.
 * Receiving any message it will try to parse it as defined by the µHome protocol
 */
import net from 'net';
import { EventEmitter } from 'events';
import to from 'await-to-js';
import {
  parseMicroHomeMessage,
  microHomeMessage,
  createPayload,
  LATEST_VERSION,
} from './protocol';
import log from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import responseObject from './response';

const defaultLogger = log.child({ service: 'µHomeBaseService' });

export const addEventHandler = (service, event, handler) =>
  service.internalEventBroker.on(event, (socket, payload) =>
    handler(payload, responseObject(service, socket)),
  ) || service;

export const initBaseService = (
  port = 5100,
  source,
  logger = defaultLogger,
  version = LATEST_VERSION,
) => {
  const internalEventBroker = new EventEmitter();

  const serviceEmitter = socket => dataBuffer => {
    try {
      const { status, payload } = parseMicroHomeMessage(dataBuffer);
      logger.debug(`Received Event '${payload.type}' with data`, {
        ...payload,
      });

      if (status !== 1) {
        throw new Error('Error in Message');
      }

      if (!internalEventBroker.listenerCount(payload.type)) {
        return socket.write(
          microHomeMessage(
            createPayload({
              source,
              type: 'µHome.response',
              data: {
                message: 'No Handler for Event registered',
              },
            }),
            1,
            version,
            logger,
          ),
        );
      }

      return internalEventBroker.emit(payload.type, socket, payload);
    } catch (err) {
      return socket.write(
        microHomeMessage(
          createPayload({
            source,
            type: 'µHome.error',
            error: err.message,
          }),
          2,
          version,
          logger,
        ),
      );
    }
  };

  return {
    version,
    source,
    address: getLocalIp(port),
    logger,
    server: net
      .createServer(socket => socket.on('data', serviceEmitter(socket)))
      .listen(port),
    internalEventBroker,
    emit: () => {}, // Will emit event to broker
  };
};

// Initiation of a microservice
export const initService = async (
  nodeId,
  {
    port = 5102,
    eventBrokerAddress,
    serviceRegistryAddress,
    version = LATEST_VERSION,
  } = {},
) => {
  if (!eventBrokerAddress) {
    throw new Error(
      "Service can only be instantiated with 'Event Broker' Address",
    );
  }

  if (!serviceRegistryAddress) {
    throw new Error(
      "Service can only be instantiated with 'Service Registry' Address",
    );
  }

  const serviceLogger = log.child({ service: nodeId });
  const baseService = initBaseService(port, nodeId, serviceLogger, version);

  // Add standard event healthcheck handler
  addEventHandler(baseService, 'µHome.core.healthcheck', (p, res) =>
    res.send('Service is healthy'),
  );

  // Microservice Registers to Service Registry
  const [err] = await to(
    sendPackage(
      microHomeMessage(
        createPayload({
          source: nodeId,
          type: 'µHome.core.register',
          data: { nodeId, address: getLocalIp(port) },
        }),
      ),
      { address: serviceRegistryAddress },
    ),
  );

  if (err) {
    serviceLogger.error(`Failed to register microservice '${nodeId}'`);
    baseService.server.close();
    throw err;
  }

  return {
    ...baseService,
    nodeId,
    subscribe: async (eventType, handler) => {
      const [subscribeErr] = await to(
        sendPackage(
          microHomeMessage(
            createPayload({
              source: nodeId,
              type: 'µHome.core.subscribe',
              data: { subscribe: eventType },
            }),
          ),
          { address: eventBrokerAddress },
        ),
      );

      if (subscribeErr) {
        serviceLogger.error(`Failed to subscribe to event '${eventType}'`, {
          reason: subscribeErr.message,
        });
        return;
      }

      serviceLogger.info(`Successful subscribe to event '${eventType}'`);
      addEventHandler(baseService, eventType, handler);
    },
  };
};
