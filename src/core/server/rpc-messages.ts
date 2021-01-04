import {
  JsonRpcDefaultErrorData,
  JsonRpcError,
  JsonRpcErrorResponse,
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcSuccessResponse,
} from '../../types';

export const rpcRequest = <T>(
  id: string,
  method: string,
  params: T,
): JsonRpcRequest<T> => ({
  jsonrpc: '2.0',
  id,
  params,
  method,
});

export const rpcNotification = <T>(
  method: string,
  params: T,
): JsonRpcNotification<T> => ({
  jsonrpc: '2.0',
  params,
  method,
});

export const rpcResponse = <T>(
  id: string,
  result: T,
): JsonRpcSuccessResponse<T> => ({
  jsonrpc: '2.0',
  id,
  result,
});
export const rpcError = <T = JsonRpcDefaultErrorData>(
  id: string,
  e: JsonRpcError<T>,
): JsonRpcErrorResponse<T> => ({ jsonrpc: '2.0', id, error: e });

export const asBuffer = (message: unknown): Buffer =>
  Buffer.from(JSON.stringify(message));
export const fromBuffer = <T>(buffer: Buffer): T =>
  JSON.parse(buffer.toString());
