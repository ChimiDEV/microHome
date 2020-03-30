/*
 * This is currently the main function for booting up the core nodes of the micro service framework.
 */

import net from 'net';
import logger from './utils/logger';
import { initializeEventBroker, broadcastEvent } from './core/eventBroker';
import { microHomeMessage, createPayload } from './core/protocol';
import { getLocalIp, sendPackage } from './utils/network';

(async () => {
  // // ---- Testing "Client"

  // const microserviceServer = net.createServer(
  //   socket =>
  //     console.log('Received Connection') ||
  //     socket.on('data', dataBuffer => {
  //       logger.info('Received Data');
  //       logger.info(dataBuffer.toString());
  //       socket.end();
  //     }),
  // );
  // microserviceServer.listen(3001);

  // // Create the eventBroker
  // const eventBroker = initializeEventBroker();

  // await broadcastEvent(
  //   eventBroker,
  //   microHomeMessage(
  //     createPayload({ source: '/microhome/test', type: 'test.broadcast.save' }),
  //   ),
  // );

  // eventBroker.server.close();
  // microserviceServer.close();

  const server1 = net.createServer(s => {
    console.log('Received Connection');
    s.on('data', data => {
      console.log(data.toString());
      s.write(Buffer.from('Received'));
    });
    s.on('end', () => console.log('Connection ended'));
  });

  server1.listen(5101);

  const res = await sendPackage(
    microHomeMessage(
      createPayload({
        source: 'microhome/test',
        type: 'local.test',
        data: { extension: true },
      }),
    ),
    getLocalIp(5101),
  );
  server1.close();

  console.log(res);
})();
