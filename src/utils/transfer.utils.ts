import { isWif } from './crypto.utils';
import { getPublicKeyFromPrivateKeyString } from './keys.utils';

export const getPrivateKeysMemoValidationWarning = (memo: string): boolean => {
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
