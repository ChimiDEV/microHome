/*
 * The Event Broker is one of the core node, that will broadcast, publish and receive events from microservices.
 */

import logger from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import { initTcpServer } from './service';

const brokerLogger = logger.child({ service: 'Event Broker' });

// eslint-disable-next-line import/prefer-default-export
export const initEventBroker = (port = 5100) => {
  // EventBroker has to maintain a list of nodes to broadcast (and accept) events to | THIS WILL BE DONE BY THE REGISTRY
  const server = initTcpServer(port, 'µHome/core/eventBroker');
  brokerLogger.info(`Initializing Event Broker at ${getLocalIp(port)}`);

  return {
    activeNodes: [{ port: 5101, address: getLocalIp() }],
    server,
    ip: getLocalIp(port),
  };
};

export const broadcastEvent = async (eventBroker, event) => {
  const promises = eventBroker.activeNodes.map(node =>
    sendPackage(event, node.address, node.port),
  );

  return Promise.all(promises);
};
