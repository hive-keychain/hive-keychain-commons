export enum VscStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  INCLUDED = 'INCLUDED',
  FAILED = 'FAILED',
}

export enum VscHistoryType {
  CONTRACT_CALL = 'CONTRACT_CALL',
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  STAKING = 'stake_hbd',
  UNSTAKING = 'unstake_hbd',
}

export enum VscToken {
  HIVE = 'HIVE',
  HBD = 'HBD',
}

export enum VscStakingOperation {
  STAKING = 'STAKING',
  UNSTAKING = 'UNSTAKING',
}

export type VscRequestParams = {
  netId?: string;
};
export type VscHistoryResponse = {
  findTransaction: VscTxResponse[];
  findLedgerActions: VscLedgerActionResponse[];
};

enum VscAsset {
  HIVE = 'hive',
  HBD = 'hbd',
}

export type VscLedgerItem = {
  amount: number;
  asset: VscAsset;
  from: string;
  memo: string;
  to: string;
  type: string;
};

export type VscLedgerActionResponse = {
  id: string;
  status: VscStatus;
  amount: number;
  asset: VscAsset;
  to: string;
  memo: string;
  action_id: string;
  type: string;
  params: any;
  block_height: number;
  timestamp: string;
};

export type VscOpsData = {
  amount: string;
  asset: VscAsset;
  from: string;
  memo: string;
  to: string;
};

export type VscTxResponse = {
  id: string;
  status: VscStatus;
  type: string;
  first_seen: string;
  nonce: number;
  anchr_index: number;
  anchr_height: number;
  anchr_ts: string;
  required_auths: string[];
  op_types: string[];
  ops: {
    data: VscOpsData;
    index: number;
    type: string;
  }[];
  ledger: VscLedgerItem[];
};

export type VscTxData = {
  amount: number;
  asset: VscAsset;
  from: string;
  memo?: string;
  to: string;
  type: VscHistoryType;
};

export type VscHistoryItem = VscTxData & {
  timestamp: Date;
  status: VscStatus;
  txId: string;
};

export type VscAccountBalance = {
  account: string;
  block_height: number;
  hbd: number;
  hbd_avg: number;
  hbd_claim: number;
  hbd_modify: number;
  hbd_savings: number;
  hive: number;
  hive_consensus: number;
  pending_hbd_unstaking: number;
};
