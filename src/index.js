/*
 * This is currently the main function for booting up the core nodes of the micro service framework.
 */
// import to from 'await-to-js';
import { initEventBroker } from './core/eventBroker';
import { initServiceRegistry } from './core/serviceRegistry';

(async () => {
  // ---- Testing "Service"

  // const microserviceServer = initTcpServer(
  //   5101,
  //   'µHome/test/dummyService',
  //   logger.child({ service: 'Dummy Service' }),
  // );

  const broker = initEventBroker();
  initServiceRegistry({ eventBrokerAddress: broker.address });
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

  setInterval(
    () => broker.broadcastEvent('local.test', { incoming: true }),
    10000,
  );
})();
