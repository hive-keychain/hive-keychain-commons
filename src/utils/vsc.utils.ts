import moment from 'moment';
import Config from '../config';
import {
  VscHistoryResponse,
  VscHistoryType,
  VscStatus,
} from '../interfaces/vsc';

const waitForStatus = async (
  id: string,
  type: VscHistoryType,
  maxIterations: number = 20,
  wait: number = 500,
): Promise<VscStatus> => {
  let iterations = 0;
  let status: VscStatus = VscStatus.UNCONFIRMED;

  while (iterations < maxIterations) {
    status = await checkStatus(id, type);
    if (status === VscStatus.CONFIRMED || status === VscStatus.FAILED)
      return status;
    iterations++;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  return status;
};

const checkStatus = (id: string, type: VscHistoryType): Promise<VscStatus> => {
  let query;
  if (
    type === VscHistoryType.CONTRACT_CALL ||
    type === VscHistoryType.WITHDRAW ||
    type === VscHistoryType.STAKING ||
    type === VscHistoryType.UNSTAKING ||
    type === VscHistoryType.TRANSFER
  ) {
    query = `{
      findTransaction(
        filterOptions: {byId:"${id}"}
      ) {
          status
      }
    }`;
  } else if (type === VscHistoryType.DEPOSIT) {
    query = `{
      findLedgerTXs(filterOptions: {byTxId: "${id}-0"}) {
      
        status
      
    }
    }`;
  }
  return fetchQuery(query).then((res) => {
    return (
      res?.data?.findTransaction?.[0]?.status ||
      res?.data?.findLedgerTXs?.[0]?.status
    );
  });
};

const fetchHistory = async (username: string): Promise<VscHistoryResponse> => {
  const query = `{
    findLedgerTXs(
      filterOptions: {byToFrom: "hive:${username}"}
    ) {
      txs {
        amount
        block_height
        from
        id
        memo
        owner
        t
        tk
        status
      }
    }
    findTransaction(filterOptions: {byAccount: "${username}"}) {
      txs {
        status
        id
        anchored_height
        data {
          action
          contract_id
          op
          payload
        }
        required_auths{value}
      }
  }}
  `;
  return (await fetchQuery(query)).data;
};

const getOrganizedHistory = async (username: string) => {
  const history = await fetchHistory(username);
  const organizedHistory = [
    ...history.findLedgerTXs.txs.map((e) => {
      e.type = VscHistoryType.TRANSFER;
      e.timestamp = blockHeightToTimestamp(e.block_height);
      return e;
    }),
    ...history.findTransaction.txs.map((e) => {
      e.type = VscHistoryType.CONTRACT_CALL;
      e.timestamp = blockHeightToTimestamp(e.anchored_height);

      return e;
    }),
  ].sort((a, b) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
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
  const regex = new RegExp(':([a-zA-Z0-9]*)$');
  const matches = did.match(regex);
  return matches?.[matches.length - 1];
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

export const VscUtils = {
  checkStatus,
  waitForStatus,
  getOrganizedHistory,
  getAddressFromDid,
};
