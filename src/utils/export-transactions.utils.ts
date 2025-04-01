import type { Operation, TransferOperation } from '@hiveio/dhive';
import moment from 'moment';
import { Asset, HistoryFiltersUtils } from '../index';
import { TransactionUtils } from './transaction.utils';

const PROPOSAL_FEE = 87;
const COLLATERALIZED_CONVERT_IMMEDIATE_CONVERSION = 88;

export interface ExportTransactionOperation {
  datetime: string;
  transactionId: string;
  blockNumber: number;
  from?: string;
  to?: string;
  amount: number;
  currency: string;
  operationType: Operation;
}

const generateCSV = (operations: ExportTransactionOperation[]): string => {
  try {
    if (!Array.isArray(operations)) {
      throw new Error('Input must be an array of operations');
    }

    if (operations.length === 0) {
      return 'Operation Type,Date,Transaction ID, Block number,From,To,Amount,Currency\r\n';
    }

    let csvContent = `Operation Type,Date,Transaction ID, Block number,From,To,Amount,Currency\r\n`;

    for (const operation of operations) {
      if (
        !operation.operationType ||
        !operation.datetime ||
        !operation.transactionId ||
        !operation.blockNumber
      ) {
        throw new Error('Missing required fields in operation');
      }

      const sanitizedValues = {
        operationType: String(operation.operationType).replace(
          /[,\r\n"]/g,
          ' ',
        ),
        datetime: String(operation.datetime).replace(/[,\r\n"]/g, ' '),
        transactionId: String(operation.transactionId).replace(
          /[,\r\n"]/g,
          ' ',
        ),
        blockNumber: String(operation.blockNumber),
        from: (operation.from ?? 'NA').replace(/[,\r\n"]/g, ' '),
        to: (operation.to ?? 'NA').replace(/[,\r\n"]/g, ' '),
        amount: String(operation.amount),
        currency: String(operation.currency).replace(/[,\r\n"]/g, ' '),
      };

      csvContent += `${sanitizedValues.operationType},${sanitizedValues.datetime},${sanitizedValues.transactionId},${sanitizedValues.blockNumber},${sanitizedValues.from},${sanitizedValues.to},${sanitizedValues.amount},${sanitizedValues.currency}\r\n`;
    }

    return csvContent;
  } catch (error: any) {
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
};
const fetchTransactions = async (
  username: string,
  startDate?: Date,
  endDate?: Date,
  feedBack?: (percentage: number) => void,
): Promise<ExportTransactionOperation[] | undefined> => {
  const MAX_LIMIT = 1000;
  const op = HistoryFiltersUtils.operationOrders;
  const operationsBitmask = HistoryFiltersUtils.makeBitMaskFilter([
    op.transfer,
    op.interest,
    op.transfer_to_vesting,
    op.fill_vesting_withdraw,
    op.fill_convert_request,
    op.fill_collateralized_convert_request,
    COLLATERALIZED_CONVERT_IMMEDIATE_CONVERSION,
    op.fill_recurrent_transfer,
    op.fill_order,
    op.producer_reward,
    op.claim_reward_balance,
    op.escrow_release,
    op.account_create,
    op.account_create_with_delegation,
    op.proposal_pay,
    op.escrow_approve,
    PROPOSAL_FEE,
  ]) as [number, number];

  const lastTransaction = await TransactionUtils.getLastTransaction(username);
  const limit = Math.min(1000, lastTransaction);
  let start = lastTransaction;
  let rawTransactions: any[] = [];
  const operations: ExportTransactionOperation[] = [];
  let forceStop = false;
  let percentageDuration;

  if (startDate) {
    startDate = moment(startDate).startOf('day').toDate();
  }
  if (!endDate) {
    endDate = new Date();
  } else {
    endDate = moment(endDate).endOf('day').toDate();
  }

  if (startDate) {
    percentageDuration = endDate.getTime() - startDate.getTime();
  }

  try {
    do {
      rawTransactions = await TransactionUtils.getTransactions(
        username,
        start,
        limit,
        operationsBitmask[0],
        operationsBitmask[1],
      );

      for (let i = rawTransactions.length - 1; i >= 0; i--) {
        const tx = rawTransactions[i];
        const operationPayload = tx[1].op[1];
        const operationType = tx[1].op[0];
        const transactionInfo = tx[1];

        // Simple timestamp handling - use original string if parsing fails
        let date;
        try {
          if (process.env.IS_FIREFOX) {
            date = moment(transactionInfo.timestamp);
          } else {
            // Try parsing with timezone marker
            const timestamp =
              transactionInfo.timestamp.endsWith('z') ||
              transactionInfo.timestamp.endsWith('Z')
                ? transactionInfo.timestamp
                : transactionInfo.timestamp + 'Z';
            date = moment(timestamp);
          }
        } catch (error) {
          console.error('Error parsing timestamp:', error);
          date = null; // Fall back to using the original string
        }

        // Use the original timestamp string if moment parsing failed
        const localDatetime =
          date && date.isValid()
            ? date.format('YYYY-MM-DD HH:mm:ss')
            : transactionInfo.timestamp;

        // Ensure date is valid for date comparisons
        const validDate = date && date.isValid() ? date : moment(new Date());

        if (
          endDate &&
          validDate.isSameOrAfter(moment(endDate).add(1, 'day'), 'day')
        )
          continue;

        if (startDate && validDate.isBefore(moment(startDate), 'day')) {
          forceStop = true;
          break;
        }

        const operation: ExportTransactionOperation = {
          operationType,
          datetime: localDatetime,
          transactionId: transactionInfo.trx_id,
          blockNumber: transactionInfo.block,
          to: 'NA',
          amount: 0,
          currency: 'NA',
          from: 'NA',
        };

        switch (operationType) {
          case 'transfer':
          case 'fill_recurrent_transfer': {
            const transferOperation = operationPayload as TransferOperation[1];
            const asset = Asset.fromString(transferOperation.amount.toString());
            operations.push({
              ...operation,
              from: transferOperation.from,
              to: transferOperation.to,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'interest': {
            const asset = Asset.fromString(
              operationPayload.interest.toString(),
            );
            operations.push({
              ...operation,
              from: 'NA',
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'transfer_to_vesting': {
            const asset = Asset.fromString(operationPayload.amount.toString());
            operations.push({
              ...operation,
              from: operationPayload.from,
              to: operationPayload.to,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'fill_vesting_withdraw': {
            const asset = Asset.fromString(
              operationPayload.deposited.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.from_account,
              to: operationPayload.to_account,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'fill_convert_request': {
            let asset = Asset.fromString(
              operationPayload.amount_out.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(operationPayload.amount_in.toString());
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'fill_collateralized_convert_request': {
            let asset = Asset.fromString(
              operationPayload.amount_out.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(operationPayload.amount_in.toString());
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(
              operationPayload.excess_collateral.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'producer_reward': {
            const asset = Asset.fromString(
              operationPayload.vesting_shares.toString(),
            );
            operations.push({
              ...operation,
              to: operationPayload.producer,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'claim_reward_balance': {
            let asset = Asset.fromString(
              operationPayload.reward_hive.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.reward_hbd.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.reward_vests.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'escrow_release': {
            let asset = Asset.fromString(
              operationPayload.hbd_amount.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.to,
                from: operationPayload.from,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.hive_amount.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.to,
                from: operationPayload.from,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'account_create':
          case 'account_create_with_delegation': {
            const asset = Asset.fromString(operationPayload.fee.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                from: operationPayload.creator,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'proposal_pay': {
            const asset = Asset.fromString(operationPayload.payment.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.receiver,
                from: operationPayload.payer,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'fill_order': {
            let asset = Asset.fromString(
              operationPayload.current_pays.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.open_owner,
                from: operationPayload.current_owner,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.open_pays.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.current_owner,
                from: operationPayload.open_owner,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'proposal_fee': {
            const asset = Asset.fromString(operationPayload.fee.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.treasury,
                from: operationPayload.creator,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          default:
            console.info(`missing ${operationType}`);
            break;
        }
      }
      let percentage;
      if (startDate && percentageDuration) {
        const tx = rawTransactions[rawTransactions.length - 1];
        const transactionInfo = tx[1];
        const date = moment(transactionInfo.timestamp + 'z').toDate();

        const passedDuration = endDate.getTime() - date.getTime();
        percentage = (passedDuration / percentageDuration) * 100;
      } else {
        const index =
          lastTransaction - rawTransactions[rawTransactions.length - 1][0];
        percentage = (index / lastTransaction) * 100;
      }
      if (feedBack) feedBack(percentage);

      start = Math.min(start - 1000, rawTransactions[0][0] - 1);
    } while (start > MAX_LIMIT && !forceStop);
    return operations;
  } catch (err) {
    console.error('Error while fetching transactions', err);
  }
  return undefined;
};

export const ExportTransactionsUtils = {
  fetchTransactions,
  generateCSV,
};
