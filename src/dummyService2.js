import { initService } from './core/service';
import { getLocalIp } from './core/network';

const nodeId = 'µHome/dummyService2';

(async () => {
  await initService(nodeId, {
    port: 5103,
    eventBrokerAddress: getLocalIp(5100),
    serviceRegistryAddress: getLocalIp(5101),
  });

  // console.log(dummyService);
  // await dummyService.subscribe('local.test', payload => console.log(payload));
  // dummyService.server.close(); // Later should have a .close / .end Method, which will unregister the service as well
})();
