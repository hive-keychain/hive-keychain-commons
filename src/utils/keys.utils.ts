import { PrivateKey } from '@hiveio/dhive';

const getPublicKeyFromPrivateKeyString = (privateKeyS: string) => {
  try {
    const privateKey = PrivateKey.fromString(privateKeyS);
    const publicKey = privateKey.createPublic();
    return publicKey.toString();
  } catch (e) {
    return null;
  }
};

export const KeysUtils = {
  getPublicKeyFromPrivateKeyString,
};
