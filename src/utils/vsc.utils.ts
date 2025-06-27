import moment from 'moment';
import Config from '../config';
import {
  RequestVscStaking,
  RequestVscTransfer,
  RequestVscWithdrawal,
} from '../interfaces/keychain';
import {
  VscAccountBalance,
  VscHistoryItem,
  VscHistoryResponse,
  VscHistoryType,
  VscStakingOperation,
  VscStatus,
} from '../interfaces/vsc';
import { FormatUtils } from './format.utils';

const waitForStatus = async (
  id: string,
  timeoutSeconds: number = 10,
  endAtStatus = VscStatus.CONFIRMED,
): Promise<VscStatus> => {
  let iterations = 0;
  let status: VscStatus = VscStatus.UNCONFIRMED;
  const wait = 500;
  const maxIterations = (timeoutSeconds / wait) * 1000;
  while (iterations < maxIterations) {
    status = await checkStatus(id);
    if (status === endAtStatus || status === VscStatus.FAILED) return status;
    iterations++;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return status;
};

const checkStatus = (id: string): Promise<VscStatus> => {
  const query = `{
      findTransaction(
        filterOptions: {byId:"${id}"}
      ) {
          status
      }
    }`;

  return fetchQuery(query).then((res) => {
    if (res?.data?.findTransaction?.[0])
      return res.data.findTransaction?.[0].status;
    return res?.data?.findLedgerTXs?.[0]?.id === id
      ? VscStatus.CONFIRMED
      : VscStatus.UNCONFIRMED;
  });
};

const fetchHistory = async (
  username: string,
  limit?: number,
  offset?: number,
): Promise<VscHistoryResponse> => {
  const query = `{
    findTransaction(filterOptions: {byAccount: "hive:${username}",limit:${limit},offset:${offset}}) {
      id
      anchr_height
      anchr_index
      anchr_ts
      type
      op_types
      first_seen
      nonce
      rc_limit
      required_auths
      status
      ops {
        required_auths
        type
        index
        data
      }
    }
  }`;
  const response = await fetchQuery(query);
  if (!response?.data) {
    console.error('Invalid response from VSC API:', response);
    return { findTransaction: [], findLedgerTXs: [] };
  }
  return response.data;
};

const getOrganizedHistory = async (username: string) => {
  const history = await fetchHistory(username);
  const organizedHistory: VscHistoryItem[] = [
    ...(history.findTransaction || [])
      .flatMap((e) =>
        e.ops.map((op) => ({
          from: op.data.from,
          to: op.data.to,
          amount: parseFloat(op.data.amount),
          timestamp: new Date(e.first_seen),
          txId: e.id,
          memo: op.data.memo,
          asset: op.data.asset,
          status: e.status,
          type: op.type as VscHistoryType,
        })),
      )
      .filter((e) => !(e.type === 'withdraw' && e.from !== `hive:${username}`)),
  ].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  return organizedHistory;
};

const blockHeightToTimestamp = (height: number) => {
  const START_BLOCK = 88079516;
  const START_BLOCK_TIME = moment('2024-08-16T02:46:48Z');
  return START_BLOCK_TIME.clone()
    .add((height - START_BLOCK) * 3, 'seconds')
    .toDate();
};

const getAddressFromDid = (did: string) => {
  const regex = new RegExp(':([a-zA-Z0-9.-]*)$');
  const matches = did.match(regex);
  return matches?.[matches.length - 1];
};

const getFormattedAddress = (address: string) => {
  if (address.startsWith('hive:')) return `@${getAddressFromDid(address)}`;
  else return FormatUtils.shortenString(getAddressFromDid(address)!, 4);
};

const fetchQuery = (query: any) => {
  return fetch(Config.vsc.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  }).then((res) => res.json());
};

const getAccountBalance = async (
  username: string,
): Promise<VscAccountBalance> => {
  const query = `{
    getAccountBalance(account: "hive:${username}") {
    account
    hbd
    hive
    hbd_savings
    hbd_claim
    hbd_modify
    hbd_avg
    block_height
    hive_consensus
    pending_hbd_unstaking
  }
  }`;
  return (
    (await fetchQuery(query)).data.getAccountBalance || {
      hive: 0,
      hbd: 0,
      hive_consensus: 0,
      hbd_avg: 0,
      hbd_claim: 0,
      hbd_modify: 0,
      hbd_savings: 0,
      pending_hbd_unstaking: 0,
    }
  );
};

const getWithdrawJson = (
  data: Omit<RequestVscWithdrawal, 'domain' | 'type'>,
  netId?: string,
) => {
  const JSON_ID = 'vsc.withdraw';
  const json = {
    net_id: data.netId || netId,
    from: data.username!.startsWith('hive:')
      ? data.username
      : `hive:${data.username}`,
    to: data.to.startsWith('hive:') ? data.to : `hive:${data.to}`,
    amount: data.amount,
    asset: data.currency.toLowerCase(),
    memo: data.memo,
  };
  return {
    id: JSON_ID,
    json,
  };
};

const getTransferJson = (
  data: Omit<RequestVscTransfer, 'domain' | 'type'>,
  netId?: string,
) => {
  const JSON_ID = 'vsc.transfer';
  const json = {
    net_id: data.netId || netId,
    from: data.username!.startsWith('hive:')
      ? data.username
      : `hive:${data.username}`,
    to: data.to.startsWith('hive:') ? data.to : `hive:${data.to}`,
    amount: data.amount,
    asset: data.currency.toLowerCase(),
    memo: data.memo,
  };
  return {
    id: JSON_ID,
    json,
  };
};

const getStakingJson = (
  data: Omit<RequestVscStaking, 'domain' | 'type'>,
  netId?: string,
) => {
  const JSON_ID =
    data.operation === VscStakingOperation.STAKING
      ? 'vsc.stake_hbd'
      : 'vsc.unstake_hbd';
  const json = {
    net_id: data.netId || netId,
    from: data.username!.startsWith('hive:')
      ? data.username
      : `hive:${data.username}`,
    to: data.to.startsWith('hive:') ? data.to : `hive:${data.to}`,
    amount: data.amount,
    asset: data.currency.toLowerCase(),
  };
  return {
    id: JSON_ID,
    json,
  };
};

export const VscUtils = {
  checkStatus,
  waitForStatus,
  getOrganizedHistory,
  getAddressFromDid,
  getAccountBalance,
  blockHeightToTimestamp,
  getFormattedAddress,
  getWithdrawJson,
  getTransferJson,
  getStakingJson,
};
