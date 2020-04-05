import { microHomeMessage, createPayload } from './protocol';

// Used to create a response object for the event handler
export default (service, socket) => ({
  send: (data = {}, additionalProps = {}) => {
    socket.write(
      microHomeMessage(
        createPayload({
          source: service.source,
          type: 'µHome.response',
          data:
            typeof data === 'string'
              ? { message: data, ...additionalProps }
              : { ...data, ...additionalProps },
        }),
        1,
        service.version,
        service.logger,
      ),
    );
  },
  error: (err, status = 0, additionalProps = {}) => {
    socket.write(
      microHomeMessage(
        createPayload({
          source: service.source,
          type: 'µHome.error',
          error:
            typeof err === 'string'
              ? { message: err, ...additionalProps }
              : { ...err, ...additionalProps },
        }),
        status,
        service.version,
        service.logger,
      ),
    );
  },
});
