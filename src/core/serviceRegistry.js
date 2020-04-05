/*
 * The service registry is a core node, that will register new services and remove them, if
 */
import DataStore from 'nedb';
import to from 'await-to-js';
import { initBaseService, addEventHandler } from './service';
import logger from '../utils/logger';
import { getLocalIp, sendPackage } from './network';
import { microHomeMessage, createPayload, LATEST_VERSION } from './protocol';

const registryLogger = logger.child({ service: 'µHomeServiceRegistry' });

const createRegistry = () => {
  const registry = new DataStore();
  return {
    registry,
    insert: newDoc =>
      new Promise((resolve, reject) =>
        registry.insert(newDoc, (err, { nodeId, address } = {}) =>
          err ? reject(err) : resolve({ nodeId, address }),
        ),
      ),
    find: query =>
      new Promise((resolve, reject) =>
        registry.find(query, (err, docs = []) =>
          err
            ? reject(err)
            : resolve(docs.map(({ nodeId, address }) => ({ nodeId, address }))),
        ),
      ),
  };
};

// eslint-disable-next-line import/prefer-default-export
export const initServiceRegistry = ({
  port = 5101,
  version = LATEST_VERSION,
  eventBrokerAddress,
} = {}) => {
  const service = initBaseService(
    port,
    'µHome/core/serviceRegistry',
    registryLogger,
    version,
  );
  const { registry, insert, find } = createRegistry();
  registryLogger.info(`Booted Node on ${getLocalIp(port)}`);

  addEventHandler(
    service,
    'µHome.core.register',
    async ({ data: { address }, source: nodeId }, res) => {
      // Healthcheck registering service
      const [healthErr] = await to(
        sendPackage(
          microHomeMessage(
            createPayload({
              source: service.source,
              type: 'µHome.core.healthcheck',
            }),
          ),
          { address },
        ),
      );

      if (healthErr) {
        res.error(`Failed to register microservice`, 2, {
          reason: 'Unhealthy service',
        });
        registryLogger.error(
          `Failed to register microservice '${nodeId}': Unhealthy service`,
        );
        return;
      }

      // Check if node id isn't already saved
      const [dbFindErr, docs] = await to(find({ nodeId }));

      if (dbFindErr) {
        res.error('Failed to register microservice', 0, {
          reason: 'Database find error',
        });
        registryLogger.error(
          `Failed to register microservice '${nodeId}': Database find error`,
        );
        return;
      }

      if (docs.length >= 1) {
        res.error('Failed to register microservice', 2, {
          reason: 'Node already exists',
        });
        registryLogger.error(
          `Failed to register microservice '${nodeId}': Node already exists`,
        );
        return;
      }

      const [dbInsertErr] = await to(insert({ nodeId, address }));
      if (dbInsertErr) {
        res.error('Failed to register microservice', 0, {
          reason: 'Database insert error',
        });
        registryLogger.error(
          `Failed to register microservice '${nodeId}': Database insert error`,
        );
        return;
      }

      res.send(`Successfully registered microservice '${nodeId}'`, { address });

      service.internalEventBroker.emit('µHome.core.updateBroker');
    },
  );

  addEventHandler(service, 'µHome.core.updateBroker', async () =>
    (([err, nodes]) =>
      err
        ? registryLogger.error('Failed to update nodes to broker', { err })
        : sendPackage(
            microHomeMessage(
              createPayload({
                ...service,
                type: 'µHome.core.nodes',
                data: {
                  nodes,
                },
              }),
              1,
              2,
              registryLogger,
            ),
            { address: eventBrokerAddress },
          ))(await to(find())),
  );

  return {
    ...service,
    registry,
  };
};
