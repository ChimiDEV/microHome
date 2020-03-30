import net from 'net';
import { networkInterfaces } from 'os';
import { flatten } from 'lodash';
import { parseMicroHomeMessage } from './protocol';

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

export const sendPackage = (dataPackage, ipv4Address, port = 5100) =>
  new Promise((resolve, reject) => {
    const [host, addressPort] = ipv4Address.split(':');
    const socket = net.createConnection({ port: addressPort || port, host });

    socket.write(dataPackage, err => {
      if (err) reject(err);
    });

    socket.on('data', response =>
      socket.end(() => resolve(parseMicroHomeMessage(response))),
    );
  });
