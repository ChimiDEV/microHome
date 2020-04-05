/*
 * The Event Broker is one of the core node, that will broadcast, publish and receive events from microservices.
 */

import logger from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import { initBaseService, addEventHandler } from './service';

const brokerLogger = logger.child({ service: 'µHomeEventBroker' });
let activeNodes = [];

// eslint-disable-next-line import/prefer-default-export
export const initEventBroker = ({ port = 5100 } = {}) => {
  // EventBroker has to maintain a list of nodes to broadcast (and accept) events to | THIS WILL BE DONE BY THE REGISTRY
  const service = initBaseService(port, 'µHome/core/eventBroker', brokerLogger);
  brokerLogger.info(`Booted Node on ${getLocalIp(port)}`);

  addEventHandler(service, 'µHome.nodes', (payload, res) => {});

  return {
    ...service,
    activeNodes: () => activeNodes,
  };
};

export const updateActiveNodes = newNodes => {
  activeNodes = newNodes;
};

export const broadcastEvent = async (eventBroker, event) => {
  const promises = eventBroker.activeNodes.map(node =>
    sendPackage(event, node.address, node.port),
  );

  return Promise.all(promises);
};
