export type LifiHistoryStatus = "PENDING" | "DONE" | "FAILED" | "INVALID";

export interface LifiHistoryToken {
  address?: string;
  chainId?: number;
  symbol?: string;
  decimals?: number;
  name?: string;
  coinKey?: string;
  logoURI?: string;
  priceUSD?: string;
}

export interface LifiHistoryTransferSide {
  token?: LifiHistoryToken;
  chainId?: number;
  amountUSD?: string;
  amount?: string;
  timestamp?: number;
}

export interface LifiHistoryItem {
  transactionId?: string;
  lifiExplorerLink?: string;
  status: LifiHistoryStatus;
  substatus?: string;
  receiving?: LifiHistoryTransferSide;
  sending?: LifiHistoryTransferSide;
}

export interface LifiHistoryResponse {
  transfers: LifiHistoryItem[];
}
