import { FormatUtils } from './format.utils';

export type EscrowHistoryMessageKey =
  | 'wallet_info_escrow_transfer_out'
  | 'wallet_info_escrow_transfer_in'
  | 'wallet_info_escrow_transfer_other'
  | 'wallet_info_escrow_approve_self'
  | 'wallet_info_escrow_approve_other'
  | 'wallet_info_escrow_reject_self'
  | 'wallet_info_escrow_reject_other'
  | 'wallet_info_escrow_dispute_self'
  | 'wallet_info_escrow_dispute_other'
  | 'wallet_info_escrow_release_self'
  | 'wallet_info_escrow_release_other';

export interface EscrowHistoryMessage {
  key: EscrowHistoryMessageKey;
  params: string[];
}

export interface EscrowTransferLike {
  from: string;
  to: string;
  escrow_id: number;
  agent?: string;
  hbd_amount?: string;
  hive_amount?: string;
  fee?: string;
}

export interface EscrowApproveLike {
  from?: string;
  to?: string;
  escrow_id: number;
  approve: boolean;
  who: string;
  agent?: string;
}

export interface EscrowDisputeLike {
  from?: string;
  to?: string;
  escrow_id: number;
  who: string;
  agent?: string;
}

export interface EscrowReleaseLike {
  from?: string;
  to?: string;
  escrow_id: number;
  who: string;
  receiver: string;
  agent?: string;
  hbd_amount?: string;
  hive_amount?: string;
}

const includesSearchValue = (
  value: string | number | undefined,
  searchValue: string,
) => {
  return value !== undefined
    ? value.toString().toLowerCase().includes(searchValue)
    : false;
};

const formatEscrowAmount = (hiveAmount?: string, hbdAmount?: string) => {
  const amounts: string[] = [];

  const normalizedHive =
    hiveAmount && FormatUtils.getValFromString(hiveAmount) > 0
      ? FormatUtils.withCommas(hiveAmount, 3)
      : undefined;
  if (normalizedHive) {
    amounts.push(normalizedHive);
  }

  const normalizedHbd =
    hbdAmount && FormatUtils.getValFromString(hbdAmount) > 0
      ? FormatUtils.withCommas(hbdAmount, 3)
      : undefined;
  if (normalizedHbd) {
    amounts.push(normalizedHbd);
  }

  if (amounts.length > 0) {
    return amounts.join(' + ');
  }

  const fallback = hiveAmount || hbdAmount;
  return fallback ? FormatUtils.withCommas(fallback, 3) : '0.000 HIVE';
};

const getEscrowTransferHistoryMessage = (
  activeAccountName: string,
  transaction: EscrowTransferLike,
): EscrowHistoryMessage => {
  const amount = formatEscrowAmount(
    transaction.hive_amount,
    transaction.hbd_amount,
  );

  if (activeAccountName === transaction.from) {
    return {
      key: 'wallet_info_escrow_transfer_out',
      params: [amount, transaction.to],
    };
  }

  if (activeAccountName === transaction.to) {
    return {
      key: 'wallet_info_escrow_transfer_in',
      params: [amount, transaction.from],
    };
  }

  return {
    key: 'wallet_info_escrow_transfer_other',
    params: [amount, transaction.from, transaction.to],
  };
};

const getEscrowApproveHistoryMessage = (
  activeAccountName: string,
  transaction: EscrowApproveLike,
): EscrowHistoryMessage => {
  const escrowId = `${transaction.escrow_id}`;
  const isSelf = activeAccountName === transaction.who;

  if (transaction.approve) {
    return {
      key: isSelf
        ? 'wallet_info_escrow_approve_self'
        : 'wallet_info_escrow_approve_other',
      params: isSelf ? [escrowId] : [transaction.who, escrowId],
    };
  }

  return {
    key: isSelf
      ? 'wallet_info_escrow_reject_self'
      : 'wallet_info_escrow_reject_other',
    params: isSelf ? [escrowId] : [transaction.who, escrowId],
  };
};

const getEscrowDisputeHistoryMessage = (
  activeAccountName: string,
  transaction: EscrowDisputeLike,
): EscrowHistoryMessage => {
  const escrowId = `${transaction.escrow_id}`;
  const isSelf = activeAccountName === transaction.who;

  return {
    key: isSelf
      ? 'wallet_info_escrow_dispute_self'
      : 'wallet_info_escrow_dispute_other',
    params: isSelf ? [escrowId] : [transaction.who, escrowId],
  };
};

const getEscrowReleaseHistoryMessage = (
  activeAccountName: string,
  transaction: EscrowReleaseLike,
): EscrowHistoryMessage => {
  const amount = formatEscrowAmount(
    transaction.hive_amount,
    transaction.hbd_amount,
  );
  const escrowId = `${transaction.escrow_id}`;
  const isSelf = activeAccountName === transaction.who;

  return {
    key: isSelf
      ? 'wallet_info_escrow_release_self'
      : 'wallet_info_escrow_release_other',
    params: isSelf
      ? [amount, transaction.receiver, escrowId]
      : [transaction.who, amount, transaction.receiver, escrowId],
  };
};

const filterEscrowTransfer = (
  escrow: EscrowTransferLike,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  return (
    includesSearchValue(escrow.hive_amount, searchValue) ||
    includesSearchValue(escrow.hbd_amount, searchValue) ||
    includesSearchValue(escrow.fee, searchValue) ||
    includesSearchValue(escrow.from, searchValue) ||
    includesSearchValue(escrow.to, searchValue) ||
    includesSearchValue(escrow.agent, searchValue) ||
    includesSearchValue(escrow.escrow_id, searchValue)
  );
};

const filterEscrowApprove = (
  escrow: EscrowApproveLike,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  return (
    includesSearchValue(escrow.from, searchValue) ||
    includesSearchValue(escrow.to, searchValue) ||
    includesSearchValue(escrow.who, searchValue) ||
    includesSearchValue(escrow.agent, searchValue) ||
    includesSearchValue(escrow.escrow_id, searchValue)
  );
};

const filterEscrowDispute = (
  escrow: EscrowDisputeLike,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  return (
    includesSearchValue(escrow.from, searchValue) ||
    includesSearchValue(escrow.to, searchValue) ||
    includesSearchValue(escrow.who, searchValue) ||
    includesSearchValue(escrow.agent, searchValue) ||
    includesSearchValue(escrow.escrow_id, searchValue)
  );
};

const filterEscrowRelease = (
  escrow: EscrowReleaseLike,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  return (
    includesSearchValue(escrow.hive_amount, searchValue) ||
    includesSearchValue(escrow.hbd_amount, searchValue) ||
    includesSearchValue(escrow.from, searchValue) ||
    includesSearchValue(escrow.to, searchValue) ||
    includesSearchValue(escrow.who, searchValue) ||
    includesSearchValue(escrow.receiver, searchValue) ||
    includesSearchValue(escrow.agent, searchValue) ||
    includesSearchValue(escrow.escrow_id, searchValue)
  );
};

export const EscrowHistoryUtils = {
  formatEscrowAmount,
  getEscrowTransferHistoryMessage,
  getEscrowApproveHistoryMessage,
  getEscrowDisputeHistoryMessage,
  getEscrowReleaseHistoryMessage,
  filterEscrowTransfer,
  filterEscrowApprove,
  filterEscrowDispute,
  filterEscrowRelease,
};
