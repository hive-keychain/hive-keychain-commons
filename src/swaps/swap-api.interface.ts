export interface SwapApiResponse {
  result?: SwapApiResult;
  error?: SwapApiError;
}

export type SwapApiResult = any;

export interface SwapApiError {
  code: number;
  message: string;
  reason?: SwapApiErrorReason;
}

export interface SwapApiErrorReason {
  template: string;
  params?: string[];
}
