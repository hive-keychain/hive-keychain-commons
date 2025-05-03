import { Exchange } from '../interfaces/exchange';
import { isWif } from './crypto.utils';
import { getPublicKeyFromPrivateKeyString } from './keys.utils';

export enum TransferWarning {
  PRIVATE_KEY_IN_MEMO = 'private_key_in_memo',
  PHISHING = 'phishing',
  EXCHANGE_DEPOSIT = 'exchange_deposit',
  EXCHANGE_MEMO = 'exchange_memo',
  EXCHANGE_RECURRENT = 'exchange_recurrent',
}
const getPrivateKeysMemoValidationWarning = (memo: string): boolean => {
  const memoTemp: string = memo.startsWith('#')
    ? memo.substring(1, memo.length)
    : memo;
  let found: RegExpMatchArray | null;
  found = memoTemp.match(/[\w\d]{51,52}/g);
  if (found) {
    for (const word of found) {
      if (isWif(word) && word.length === 51) {
        if (getPublicKeyFromPrivateKeyString(word)) return true;
      } else if (word.startsWith('P') && word.length === 52) {
        return true;
      }
    }
  }
  return false;
};

const getTransferWarning = (
  account: string,
  exchanges: Exchange[],
  currency: string,
  memo: any,
  phisingAccounts: any,
  isRecurrent?: boolean,
) => {
  const exchangeWarning = getExchangeValidationWarning(
    account,
    exchanges,
    currency,
    memo.length > 0,
    isRecurrent,
  );
  if (exchangeWarning) return exchangeWarning;

  const privateKeyInMemoWarning = getPrivateKeysMemoValidationWarning(memo);
  if (privateKeyInMemoWarning) return TransferWarning.PRIVATE_KEY_IN_MEMO;
  // return chrome.i18n.getMessage('popup_warning_private_key_in_memo');

  if (phisingAccounts.includes(account)) {
    return TransferWarning.PHISHING;
    // return chrome.i18n.getMessage('popup_warning_phishing', [account]);
  }

  return;
};

const getExchangeValidationWarning = (
  account: string,
  exchanges: Exchange[],
  currency: string,
  hasMemo: boolean,
  isRecurrent?: boolean,
) => {
  const exchange = exchanges.find((exchange) => exchange.username === account);
  if (!exchange) return;
  if (!exchange.acceptedCoins.includes(currency)) {
    // return chrome.i18n.getMessage('popup_warning_exchange_deposit', [currency]);
    return TransferWarning.EXCHANGE_DEPOSIT;
  }
  if (!hasMemo) {
    // return chrome.i18n.getMessage('popup_warning_exchange_memo');
    return TransferWarning.EXCHANGE_MEMO;
  }
  if (isRecurrent) return TransferWarning.EXCHANGE_RECURRENT;
  // return chrome.i18n.getMessage(
  //   'popup_html_transfer_recurrent_exchange_warning',
  // );

  return;
};

export const TransferUtils = {
  getTransferWarning,
};
