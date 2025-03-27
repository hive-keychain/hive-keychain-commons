import type { Operation } from '@hiveio/dhive';
import { call } from 'hive-tx';
import { HistoryFiltersUtils } from '../index';

const getData = async (
  method: string,
  params: any[] | object,
  timeout: number = 3000,
): Promise<any> => {
  const response = await call(method, params, timeout);
  if (response?.result) {
    return response.result;
  }
  throw new Error(
    `Error while retrieving data from ${method} : ${JSON.stringify(
      response.error,
    )}`,
  );
};

const getTransactions = async (
  account: string,
  start: number,
  limit: number,
  operationFilterLow: number,
  operationFilterHigh: number,
): Promise<any[]> => {
  return getData('condenser_api.get_account_history', [
    account,
    start,
    limit,
    operationFilterLow,
    operationFilterHigh,
  ]);
};

const getLastTransaction = async (accountName: string): Promise<number> => {
  const op = HistoryFiltersUtils.operationOrders;
  const allOp = Object.values(op);
  const allOperationsBitmask = HistoryFiltersUtils.makeBitMaskFilter(allOp) as [
    number,
    number,
  ];
  const transactionsFromBlockchain = await getTransactions(
    accountName,
    -1,
    1,
    allOperationsBitmask[0],
    allOperationsBitmask[1],
  );

  return transactionsFromBlockchain.length > 0
    ? transactionsFromBlockchain[0][0]
    : -1;
};

export const TransactionUtils = {
  getData,
  getTransactions,
  getLastTransaction,
};
