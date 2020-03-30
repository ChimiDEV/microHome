import { microHomeMessage } from '../src/core/protocol';

describe('Core: µHome Protocol', () => {
  describe('v1', () => {
    it('does correctly create protocol packet from array', () => {
      microHomeMessage([1, 2, 3], 1);
    });

    it('does correctly create protocol packet from object', () => {
      microHomeMessage({ test: 'aPayload' }, 1);
    });

    it('does correctly create protocol packet from JSON string', () => {
      microHomeMessage(JSON.stringify({ test: 'aPayload' }), 1);
    });

    it('does throw error if payload is of an invalid type', () => {
      expect(() => microHomeMessage(123, 1)).toThrow(
        'Payload can only be an array, object or string.',
      );

      expect(() => microHomeMessage(null, 1)).toThrow(
        'Payload can only be an array, object or string.',
      );
    });
  });

  describe('v2', () => {
    it('does correctly create protocol packet from object', () => {
      microHomeMessage(
        {
          version: '2',
          source: '/microhome/testsuite',
          id: 'CREATED',
          timestamp: new Date().toISOString(),
          type: 'microhome.test.protocol',
        },
        2,
      );
    });

    it('does throw, if given payload does not contain all needed properties', () => {
      expect(() => microHomeMessage({ test: 'aPayload' }, 2)).toThrow(
        'Payload does not contain every required µHomeEvent properties.',
      );
    });

    it('does throw error if payload is of an invalid type', () => {
      expect(() => microHomeMessage(123, 2)).toThrow(
        'Payload can only be of type object.',
      );

      expect(() => microHomeMessage(null, 2)).toThrow(
        'Payload can only be of type object.',
      );

      expect(() => microHomeMessage([1, 2, 3], 2)).toThrow();
      expect(() =>
        microHomeMessage(JSON.stringify({ test: 'aPayload' }), 2),
      ).toThrow();
    });
  });
});
