import net from 'net';
import { networkInterfaces } from 'os';
import { flatten } from 'lodash';
import { parseMicroHomeMessage } from './protocol';
import { NetworkError } from './error';

export const getLocalIp = port =>
  networkInterfaces()
  |> Object.values
  |> flatten
  |> (interfaces =>
    interfaces.filter(
      ({ family, internal }) => family === 'IPv4' && !internal,
    ))
  |> (interfaces =>
    interfaces.find(({ address }) => address.startsWith('192.168')).address)
  |> (ip => (port ? `${ip}:${port}` : ip));

// Currently only supports IPv4
export const sendPackage = (
  dataPackage,
  { address, host, port, timeout = 3000 } = {},
) =>
  new Promise((resolve, reject) => {
    if (address && !net.isIPv4(address.split(':')[0]) && !net.isIPv4(host)) {
      throw new Error('Only IPv4 is supported by sendPackage');
    }

    // Either use address (host+port) or host and port are given independently
    const connectionOptions = (([h, p]) => ({ host: h, port: p }))(
      (address && address.split(':')) || [host, port],
    );
    const socket = net.createConnection(connectionOptions);

    socket.write(dataPackage, err => {
      if (err) reject(new NetworkError(err.message));
    });

    const reqTimeout = setTimeout(() => {
      reject(new NetworkError('Request timed out'));
    }, timeout);

    socket.on('data', response =>
      (parsedRes =>
        clearTimeout(reqTimeout) ||
        socket.end(() =>
          parsedRes.status === 1
            ? resolve(parsedRes)
            : reject(new NetworkError("Response isn't successful", parsedRes)),
        ))(parseMicroHomeMessage(response)),
    );
  });
