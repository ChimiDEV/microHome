/*
 * This is currently the main function for booting up the core nodes of the micro service framework.
 */

import { initEventBroker, updateActiveNodes } from './core/eventBroker';
import { initServiceRegistry } from './core/serviceRegistry';
import { getLocalIp } from './core/network';

(async () => {
  // ---- Testing "Service"

  // const microserviceServer = initTcpServer(
  //   5101,
  //   'µHome/test/dummyService',
  //   logger.child({ service: 'Dummy Service' }),
  // );

  const broker = initEventBroker();
  initServiceRegistry({ eventBrokerAddress: getLocalIp(5100) });
  // const responses = await broadcastEvent(
  //   eventBroker,
  //   microHomeMessage(
  //     createPayload({
  //       source: 'microhome/test',
  //       type: 'local.test',
  //       data: { extension: true },
  //     }),
  //     1,
  //     2,
  //     eventBroker.logger,
  //   ),
  // );

  // console.log(responses[0].payload);

  // microserviceServer.close();
  // eventBroker.server.close();
})();
