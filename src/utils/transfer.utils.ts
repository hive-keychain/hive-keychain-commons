import { cryptoUtils } from '@hiveio/dhive';
import { KeysUtils } from './keys.utils';

const getPrivateKeysMemoValidationWarning = (memo: string): boolean => {
  let memoTemp: string = memo.startsWith('#')
    ? memo.substring(1, memo.length)
    : memo;
  let found: RegExpMatchArray | null;
  found = memoTemp.match(/[\w\d]{51,52}/g);
  if (found) {
    for (const word of found) {
      if (cryptoUtils.isWif(word) && word.length === 51) {
        if (KeysUtils.getPublicKeyFromPrivateKeyString(word)) return true;
      } else if (word.startsWith('P') && word.length === 52) {
        return true;
      }
    }
  }
  return false;
};

export const TransferUtils = { getPrivateKeysMemoValidationWarning };
