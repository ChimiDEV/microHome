import { pipe } from 'fp-ts/lib/function';
import { create, listen, register } from './core/server/service';
import { asBuffer, rpcRequest } from './core/server/rpc-messages';
import { localIp, sendTcpPackage } from './core/server/network';
// import logger from './utils/logger';

pipe(
  create({}),
  register('µHome/add')<{ param1: number; param2: number }>(
    async ({ request, response }) =>
      console.log(
        request,
        await response.send(request.params.param1 + request.params.param2),
      ),
  ),
  listen(5100),
);

const address = localIp();

(async () => {
  console.log(
    await sendTcpPackage(
      { timeout: 3000 },
      5100,
      address,
      asBuffer(
        rpcRequest('123', 'µHome.healthcheck', { param1: 10, param2: 11 }),
      ),
    ),
  );
})();
