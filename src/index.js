/*
 * This is currently the main function for booting up the core nodes of the micro service framework.
 */

import logger from './utils/logger';
import { initEventBroker, broadcastEvent } from './core/eventBroker';
import { microHomeMessage, createPayload } from './core/protocol';
import { initTcpServer } from './core/service';

(async () => {
  // // ---- Testing "Service"

  const microserviceServer = initTcpServer(
    5101,
    'µHome/test/dummyService',
    logger.child({ service: 'Dummy Service' }),
  );

  // Create the eventBroker
  const eventBroker = initEventBroker();

  await broadcastEvent(
    eventBroker,
    microHomeMessage(
      createPayload({
        source: 'microhome/test',
        type: 'local.test',
        data: { extension: true },
      }),
    ),
  );

  microserviceServer.close();
  eventBroker.server.close();
})();
