/*
 * The Event Broker is one of the core node, that will broadcast, publish and receive events from microservices.
 */

import logger from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import { initBaseService } from './service';

const brokerLogger = logger.child({ service: 'µHomeEventBroker' });

// eslint-disable-next-line import/prefer-default-export
export const initEventBroker = ({ port = 5100 } = {}) => {
  // EventBroker has to maintain a list of nodes to broadcast (and accept) events to | THIS WILL BE DONE BY THE REGISTRY
  const service = initBaseService(port, 'µHome/core/eventBroker', brokerLogger);
  brokerLogger.info(`Booted Node on ${getLocalIp(port)}`);

  return {
    ...service,
    activeNodes: [{ port: 5101, address: getLocalIp() }],
  };
};

export const broadcastEvent = async (eventBroker, event) => {
  const promises = eventBroker.activeNodes.map(node =>
    sendPackage(event, node.address, node.port),
  );

  return Promise.all(promises);
};
