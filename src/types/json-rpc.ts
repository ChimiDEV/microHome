type JsonRpcBase = { jsonrpc: '2.0' };
type JsonRpcCall<Params> = {
  method: string;
  params: Params;
};

/**
 * Example usage:
 * JsonRpcRequest<[number, string]> - By Position
 * JsonRpcRequest<{name: string, aParam: boolean}> - By Name
 */
export type JsonRpcRequest<Params = unknown> = JsonRpcBase &
  JsonRpcCall<Params> & {
    id: string;
  };

export type JsonRpcNotification<Params = unknown> = JsonRpcBase &
  JsonRpcCall<Params>;

export type JsonRpcSuccessResponse<Result> = JsonRpcBase & {
  id: string;
  result: Result;
};

export type JsonRpcErrorResponse<
  ErrorData = JsonRpcDefaultErrorData
> = JsonRpcBase & {
  id: string;
  error: JsonRpcError<ErrorData>;
};

export type JsonRpcDefaultErrorData = {
  [key: string]: string | number | boolean;
};

export type JsonRpcError<ErrorData = JsonRpcDefaultErrorData> = {
  code: number;
  message: string;
  data: ErrorData;
};
