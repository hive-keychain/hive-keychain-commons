import moment from 'moment';
import Config from '../config';
import {
  RequestVscStaking,
  RequestVscTransfer,
  RequestVscWithdrawal,
} from '../interfaces/keychain';
import {
  VscHistoryItem,
  VscHistoryResponse,
  VscHistoryType,
  VscStakingOperation,
  VscStatus,
} from '../interfaces/vsc';
import { FormatUtils } from './format.utils';

const waitForStatus = async (
  id: string,
  type: VscHistoryType,
  timeoutSeconds: number = 10,
  endAtStatus = VscStatus.CONFIRMED,
): Promise<VscStatus> => {
  let iterations = 0;
  let status: VscStatus = VscStatus.UNCONFIRMED;
  const wait = 500;
  const maxIterations = (timeoutSeconds / wait) * 1000;
  while (iterations < maxIterations) {
    status = await checkStatus(id, type);
    if (status === endAtStatus || status === VscStatus.FAILED) return status;
    iterations++;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return status;
};

const checkStatus = (id: string, type: VscHistoryType): Promise<VscStatus> => {
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

const fetchHistory = async (username: string): Promise<VscHistoryResponse> => {
  const query = `{
  #  findLedgerTXs(filterOptions: {byToFrom: "hive:${username}",byTypes: "deposit"}) {
  #           amount
  #           asset
  #           block_height
  #           from
  #           id
  #           owner
  #           timestamp
  #           tx_id
  #           type
  #     }
  findTransaction(filterOptions: {byLedgerToFrom: "hive:${username}"}) {
    anchr_height
    anchr_index
    anchr_opidx
    anchr_ts
    data
    first_seen
    id
    ledger {
      amount
      asset
      from
      memo
      params
      to
      type
    }
    nonce
    rc_limit
    required_auths
    status
    type
  }}
  `;
  return (await fetchQuery(query)).data;
};

const getOrganizedHistory = async (username: string) => {
  const history = await fetchHistory(username);
  const organizedHistory: VscHistoryItem[] = [
    // ...(history.findLedgerTXs || [])
    //   .map((e) => {
    //     return {
    //       from: e.from,
    //       to: e.owner,
    //       amount: e.amount,
    //       timestamp: new Date(e.timestamp + 'Z'),
    //       txId: e.id,
    //       asset: e.asset,
    //       status: VscStatus.CONFIRMED,
    //       type: VscHistoryType.DEPOSIT,
    //     };
    //   })
    //   .filter((e) => e.to === `hive:${username}`),
    ...(history.findTransaction || [])
      .map((e) => {
        return {
          from: e.data.from,
          to: e.data.to,
          amount: e.data.amount,
          timestamp: e.first_seen,
          txId: e.id,
          memo: e.data.memo,
          asset: e.data.asset,
          status: e.status,
          type: e.data.type,
        };
      })
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

const getAccountBalance = async (username: string) => {
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
  }
  }`;
  return (await fetchQuery(query)).data.getAccountBalance;
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
