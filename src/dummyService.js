import to from 'await-to-js';
import { initService } from './core/service';
import { getLocalIp } from './core/network';

const nodeId = 'µHome/dummyService';

(async () => {
  const [err, dummyService] = await to(
    initService(nodeId, {
      eventBrokerAddress: getLocalIp(5100),
      serviceRegistryAddress: getLocalIp(5101),
    }),
  );

  if (err) {
    return;
  }

  // console.log(dummyService);
  await dummyService.subscribe('local.test', (payload, res) =>
    res.send('Received'),
  );

  // dummyService.server.close(); // Later should have a .close / .end Method, which will unregister the service as well
})();
