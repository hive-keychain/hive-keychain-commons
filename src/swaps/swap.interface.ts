export interface EstimateSwapStep {
  type: SwapStepType;
  amountStartToken: number;
  estimate: number;
  startToken: string;
  endToken: string;
  provider: Provider;
}

export enum SwapStepType {
  DEPOSIT_TO_HIVE_ENGINE = 'DEPOSIT_TO_HIVE_ENGINE',
  WITHDRAWAL_FROM_HIVE_ENGINE = 'WITHDRAWAL_FROM_HIVE_ENGINE',
  SWAP_TOKEN = 'SWAP_TOKEN',
  BUY_ON_HIVE_ENGINE_MARKET = 'BUY_ON_HIVE_ENGINE_MARKET',
  SELL_ON_HIVE_ENGINE_MARKET = 'SELL_ON_HIVE_ENGINE_MARKET',
  BUY_ON_MARKET = 'BUY_ON_MARKET',
  SELL_ON_MARKET = 'SELL_ON_MARKET',
}

export enum Provider {
  HIVE_INTERNAL_MARKET = 'HIVE_INTERNAL_MARKET',
  BEESWAP = 'BEESWAP',
  HIVE_PAY = 'HIVE_PAY',
  DISCOUNTED_BRIDGE = 'DISCOUNTED_BRIDGE',
  LEODEX = 'LEODEX',
  HIVE_ENGINE = 'HIVE_ENGINE',
  LIQUIDITY_POOL = 'LIQUIDITY_POOL',
  HIVE_ENGINE_INTERNAL_MARKET = 'HIVE_ENGINE_INTERNAL_MARKET',
  NULL = 'NULL',
}

export enum SwapStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  CANCELED_DUE_TO_ERROR = 'CANCELED_DUE_TO_ERROR',
  REFUNDED_SLIPPAGE = 'REFUND_SLIPPAGE',
  COMPLETED = 'COMPLETED',
  FUNDS_RETURNED = 'FUNDS_RETURNED',
}

export enum StepHistoryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface ISwap {
  id: string;
  username: string;
  startToken: string;
  endToken: string;
  amount: number;
  expectedAmountAfterFee: number;
  expectedAmountBeforeFee: number;
  slipperage: number;
  status: SwapStatus;
  received: number;
  fee: number;
  feeTransactionId: string;
  transferTransactionId: string;
  steps: IStep[];
  history: IStepHistory[];
  createdAt: Date;
  updatedAt: Date;
  transferInitiated: boolean;
}

export interface IStepHistory {
  id: number;
  transactionId: string;
  status: StepHistoryStatus;
  type: SwapStepType;
  stepNumber: number;
  startToken: string;
  amountStartToken: number;
  endToken: string;
  amountEndToken: number;
  minimumExpectedAmount: number;
  provider: Provider;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStep {
  id: number;
  type: SwapStepType;
  stepNumber: number;
  amountStartToken: number;
  startToken: string;
  estimate: number;
  endToken: string;
  provider: Provider;
}
