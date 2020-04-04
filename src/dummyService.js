import logger from './utils/logger';
import { initService } from './core/service';
import { sendPackage, getLocalIp } from './core/network';
import { microHomeMessage, createPayload } from './core/protocol';

const nodeId = 'µHome/dummyService';

initService(5102, nodeId, logger.child({ service: 'Dummy Service' }));

(async () => {
  const res = await sendPackage(
    microHomeMessage(
      createPayload({
        source: nodeId,
        type: 'µHome.register',
        data: { nodeId, address: getLocalIp(5102) },
      }),
    ),
    getLocalIp(5101),
  );
  console.log(res);
})();
