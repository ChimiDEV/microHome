/*
 * The Event Broker is one of the core node, that will broadcast, publish and receive events from microservices.
 */

import net from 'net';
import logger from '../utils/logger';
import { getLocalIp } from '../utils/network';
import { microHomeMessage, createPayload } from './protocol';

const brokerLogger = logger.child({ service: 'Event Broker' });

// eslint-disable-next-line import/prefer-default-export
export const initializeEventBroker = (port = 3000) => {
  // EventBroker has to maintain a list of nodes to broadcast (and accept) events to | THIS WILL BE DONE BY THE REGISTRY
  const server = net.createServer();
  server.listen(port);
  server.activeNodes = [];

  brokerLogger.info('Initializing Event Broker', {
    broker: { ip: getLocalIp(port) },
  });

  return {
    activeNodes: [{ port: 3001, address: getLocalIp() }],
    server,
    ip: getLocalIp(port),
  };
};

export const broadcastEvent = async (eventBroker, event) => {
  const promises = eventBroker.activeNodes.map(
    node =>
      new Promise((resolve, reject) => {
        const socket = net.connect({ port: node.port, host: node.address });
        socket.write(event, err => (err ? reject(err) : resolve(event)));
      }),
  );

  return Promise.all(promises);
};
