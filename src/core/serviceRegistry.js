/*
 * The service registry is a core node, that will register new services and remove them, if
 */
import DataStore from 'nedb';
import { initBaseService, addEventHandler } from './service';
import logger from '../utils/logger';
import { getLocalIp } from './network';

const registryLogger = logger.child({ service: 'µHomeServiceRegistry' });

// eslint-disable-next-line import/prefer-default-export
export const initServiceRegistry = ({
  port = 5101,
  eventBrokerAddress,
} = {}) => {
  const service = initBaseService(
    port,
    'µHome/core/serviceRegistry',
    registryLogger,
  );
  const registry = new DataStore();

  registryLogger.info(`Booted Node on ${getLocalIp(port)}`);

  addEventHandler(service, 'µHome.register', (payload, res) => {
    console.log(payload);
    res.send('Registered!');
  });

  return {
    ...service,
    registry,
  };
};
