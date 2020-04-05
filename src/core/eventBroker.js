/*
 * The Event Broker is one of the core node, that will broadcast, publish and receive events from microservices.
 */

import logger from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import { initBaseService, addEventHandler } from './service';
import { LATEST_VERSION, microHomeMessage, createPayload } from './protocol';

const brokerLogger = logger.child({ service: 'µHomeEventBroker' });
let activeNodes = [];

const broadcastToNodes = async (
  eventBroker,
  nodes,
  eventType,
  eventData,
  version = LATEST_VERSION,
) => {
  const promises = nodes.map(node =>
    sendPackage(
      microHomeMessage(
        createPayload({
          source: eventBroker.source,
          type: eventType,
          data: eventData,
        }),
        1,
        version,
        eventBroker.logger,
      ),
      { address: node.address },
    ),
  );

  return Promise.all(promises);
};

// eslint-disable-next-line import/prefer-default-export
export const initEventBroker = ({
  port = 5100,
  version = LATEST_VERSION,
} = {}) => {
  const service = initBaseService(
    port,
    'µHome/core/eventBroker',
    brokerLogger,
    version,
  );
  brokerLogger.info(`Booted Node on ${getLocalIp(port)}`);

  addEventHandler(
    service,
    'µHome.core.nodes',
    ({ data: { nodes: newNodes } } = {}, res) => {
      brokerLogger.info('Received Nodes', { nodes: newNodes });
      // Updates incoming node array with the state of former (current) nodes. Used to retain the subscription state
      activeNodes = newNodes.map(incoming => ({
        ...activeNodes.find(current => incoming.nodeId === current.nodeId),
        ...incoming,
      }));
      res.send('Succesfully updated active nodes');
    },
  );

  addEventHandler(
    service,
    'µHome.core.subscribe',
    ({ data: { subscribe }, source: nodeId } = {}, res) => {
      if (!nodeId) {
        res.error(`Failed to subscribe for microservice to event`, 2, {
          reason: 'Request did not contain a NodeId (source)',
        });
        brokerLogger.error(
          `Failed to subscribe microservice 'UNKOWN' to event '${subscribe}': Request did not contain a NodeId (source)`,
        );
        return;
      }

      if (!subscribe) {
        res.error(`Failed to subscribe for microservice to event`, 2, {
          reason: 'Request did not contain a event to subscribe to',
        });
        brokerLogger.error(
          `Failed to subscribe microservice '${nodeId}' to event 'UNKOWN': Request did not contain a event to subscribe to`,
        );
        return;
      }

      if (!activeNodes.find(({ nodeId: idToFind }) => idToFind === nodeId)) {
        res.error(`Failed to subscribe for microservice to event`, 2, {
          reason: 'Node is not registered',
        });
        brokerLogger.error(
          `Failed to subscribe microservice '${nodeId}' to event '${subscribe}': Node is not registered`,
        );
        return;
      }

      activeNodes = activeNodes.map(
        ({ nodeId: id, subscriptions = [], ...node }) =>
          id === nodeId && {
            ...node,
            nodeId,
            subscriptions: [...new Set([...subscriptions, subscribe])],
          },
      );

      res.send('Successful subscribed to event');
    },
  );

  const subscribedNodes = eventType =>
    activeNodes.filter(({ subscriptions = [] }) =>
      subscriptions.includes(eventType),
    );

  return {
    ...service,
    activeNodes: () => activeNodes,
    subscribedNodes,
    broadcastAll: (eventType, eventData) =>
      broadcastToNodes(service, activeNodes, eventType, eventData, version),
    broadcastEvent: (eventType, eventData) =>
      broadcastToNodes(
        service,
        subscribedNodes(eventType),
        eventType,
        eventData,
        version,
      ),
  };
};
