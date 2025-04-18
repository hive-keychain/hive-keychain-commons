export enum VscStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  INCLUDED = 'INCLUDED',
  FAILED = 'FAILED',
}

export enum VscHistoryType {
  CONTRACT_CALL = 'CONTRACT_CALL',
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  STAKING = 'STAKING',
  UNSTAKING = 'UNSTAKING',
}

export enum VscLedgerType {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
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
  findLedgerTXs: {
    txs: VscTransfer[];
  };
  findTransaction: {
    txs: VscCall[];
  };
};

export type VscTransfer = {
  type?: VscHistoryType.TRANSFER;
  amount: number;
  block_height: number;
  from: string;
  id: string;
  memo: string | null;
  owner: string;
  t: VscLedgerType;
  tk: VscToken;
  timestamp: Date;
  status: VscStatus;
};

export type VscCall = {
  type?: VscHistoryType.CONTRACT_CALL;
  status: VscStatus;
  id: string;
  anchored_height: number;
  timestamp: Date;
  data: {
    action: string;
    contract_id: string;
    op: string;
    payload: object;
  };
  required_auths: { value: string }[];
};
