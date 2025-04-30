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
  findLedgerTXs: VscLedgerTxResponse[];
  findTransaction: VscTxResponse[];
};

enum VscAsset {
  HIVE = 'hive',
  HBD = 'hbd',
}
export type VscLedgerTxResponse = {
  amount: number;
  block_height: number;
  from: string;
  id: string;
  owner: string;
  timestamp: Date;
  asset: VscAsset;
  tx_id: string;
  type: string;
};

export type VscTxResponse = {
  status: VscStatus;
  id: string;
  anchr_height: number;
  timestamp: Date;
  data: VscTxData;
  required_auths: { value: string }[];
  anchr_index: number;
  anchr_opidx: number;
  anchr_ts: Date;
  first_seen: Date;
  ledger: any[];
  nonce: number;
  rc_limit: number;
  type: string;
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
};
