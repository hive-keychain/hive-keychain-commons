import * as bs58 from 'bs58';
import { RIPEMD160, SHA256, lib } from 'crypto-js';
const sha256 = (input: any): Buffer => {
  if (typeof input !== 'string') {
    input = lib.WordArray.create(input);
  }
  const hash = Buffer.from(SHA256(input).toString(CryptoJS.enc.Hex), 'hex');
  return hash;
};

const ripemd160 = (input: any) => {
  // return crypto.createHash('ripemd160').update(input).digest()
  if (typeof input !== 'string') {
    input = CryptoJS.lib.WordArray.create(input);
  }
  const hash = Buffer.from(RIPEMD160(input).toString(CryptoJS.enc.Hex), 'hex');
  return hash;
};
export const isWif = (privWif: string | Buffer): boolean => {
  try {
    const bufWif = new Buffer(bs58.decode(privWif as string));
    const privKey = bufWif.slice(0, -4);
    const checksum = bufWif.slice(-4);
    let newChecksum = sha256(privKey);
    newChecksum = sha256(newChecksum);
    newChecksum = newChecksum.slice(0, 4);
    return checksum.toString() === newChecksum.toString();
  } catch (e) {
    return false;
  }
};
