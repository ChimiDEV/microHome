import net from 'net';
import { networkInterfaces } from 'os';
import _ from 'lodash/fp';
import { pipe } from 'fp-ts/lib/function';

// Mostly internal util functions for networking

export const localIp = (port?: number | string): string =>
  pipe(
    networkInterfaces(),
    Object.values,
    _.flatten,
    (interfaces: Array<any>) =>
      interfaces.filter(
        ({ family, internal }: { family: string; internal: boolean }) =>
          family === 'IPv4' && !internal,
      ),
    interfaces =>
      interfaces.find(({ address }: { address: string }) =>
        address.startsWith('192.168'),
      ).address,
    ip => (port ? `${ip}:${port}` : ip),
  );

export const sendTcpPackage = (
  { timeout = 3000 }: { timeout: number | boolean },
  port: number,
  address: string,
  data: unknown,
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    if (address && !net.isIPv4(address)) {
      reject(new Error('Only IPv4 is supported by sendPackage'));
    }

    const socket = net.createConnection({ host: address, port });

    // Send data to node
    socket.write(data as Buffer, err => {
      if (err) reject(new Error(err.message));
    });

    if (_.isBoolean(timeout) && !timeout) {
      // Don't wait for any response and end connection.
      return socket.end(() => resolve(null));
    }

    const reqTimeout = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout as number);

    socket.on('data', response => {
      clearTimeout(reqTimeout);
      socket.end(() => resolve(JSON.parse(response.toString())));
    });
  });

export const notifiy = (
  port: number,
  address: string,
  data: unknown,
): Promise<unknown> => sendTcpPackage({ timeout: false }, port, address, data);
