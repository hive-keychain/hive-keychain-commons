import type { Operation, Transaction } from '@hiveio/dhive';
import { IStep } from '../swaps/swap.interface';
import { VscRequestParams, VscStakingOperation } from './vsc';

export enum KeychainRequestTypes {
  decode = 'decode',
  encode = 'encode',
  encodeWithKeys = 'encodeWithKeys',
  signBuffer = 'signBuffer',
  broadcast = 'broadcast',
  addAccountAuthority = 'addAccountAuthority',
  removeAccountAuthority = 'removeAccountAuthority',
  removeKeyAuthority = 'removeKeyAuthority',
  addKeyAuthority = 'addKeyAuthority',
  signTx = 'signTx',
  post = 'post',
  vote = 'vote',
  custom = 'custom',
  signedCall = 'signedCall',
  transfer = 'transfer',
  sendToken = 'sendToken',
  delegation = 'delegation',
  witnessVote = 'witnessVote',
  proxy = 'proxy',
  powerUp = 'powerUp',
  powerDown = 'powerDown',
  createClaimedAccount = 'createClaimedAccount',
  createProposal = 'createProposal',
  removeProposal = 'removeProposal',
  updateProposalVote = 'updateProposalVote',
  addAccount = 'addAccount',
  convert = 'convert',
  recurrentTransfer = 'recurrentTransfer',
  swap = 'swap',
  vscCallContract = 'vscCallContract',
  vscDeposit = 'vscDeposit',
  vscWithdrawal = 'vscWithdrawal',
  vscTransfer = 'vscTransfer',
  vscStaking = 'vscStaking',
}

export enum KeychainKeyTypes {
  posting = 'Posting',
  active = 'Active',
  memo = 'Memo',
}

export enum KeychainKeyTypesLC {
  posting = 'posting',
  active = 'active',
  memo = 'memo',
}

type CommonRequestParams = {
  rpc?: string;
  domain: string;
  key?: string;
};

export type RequestDecode = CommonRequestParams & {
  type: KeychainRequestTypes.decode;
  username: string;
  message: string;
  method: KeychainKeyTypes;
};

export type RequestEncode = CommonRequestParams & {
  type: KeychainRequestTypes.encode;
  username: string;
  receiver: string;
  message: string;
  method: KeychainKeyTypes;
};

export type RequestEncodeWithKeys = CommonRequestParams & {
  type: KeychainRequestTypes.encodeWithKeys;
  username: string;
  publicKeys: string[];
  message: string;
  method: KeychainKeyTypes;
};

export type ExcludeCommonParams<T> = Omit<T, 'rpc' | 'type' | 'key' | 'domain'>;

export type RequestSignBuffer = CommonRequestParams & {
  type: KeychainRequestTypes.signBuffer;
  username?: string;
  message: string;
  method: KeychainKeyTypes;
  title?: string;
};

export type RequestBroadcast = CommonRequestParams & {
  type: KeychainRequestTypes.broadcast;
  username: string;
  operations: string | Operation[];
  method: KeychainKeyTypes;
};

export type RequestAddAccountAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.addAccountAuthority;
  authorizedUsername: string;
  role: KeychainKeyTypes;
  weight: number;
  username: string;
};

export type RequestRemoveAccountAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.removeAccountAuthority;
  authorizedUsername: string;
  role: KeychainKeyTypes;
  username: string;
};

export type RequestAddKeyAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.addKeyAuthority;
  authorizedKey: string;
  role: KeychainKeyTypes;
  username: string;
  weight: number;
};

export type RequestRemoveKeyAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.removeKeyAuthority;
  authorizedKey: string;
  role: KeychainKeyTypes;
  username: string;
};

export type RequestSignTx = CommonRequestParams & {
  type: KeychainRequestTypes.signTx;
  username: string;
  tx: Transaction;
  method: KeychainKeyTypes;
};

export type RequestPost = CommonRequestParams & {
  type: KeychainRequestTypes.post;
  username: string;
  title?: string;
  body: string;
  parent_perm: string;
  parent_username?: string;
  json_metadata: string;
  permlink: string;
  comment_options: string;
};

export type RequestVote = CommonRequestParams & {
  type: KeychainRequestTypes.vote;
  username: string;
  permlink: string;
  author: string;
  weight: string | number;
};

export type RequestCustomJSON = CommonRequestParams & {
  type: KeychainRequestTypes.custom;
  username?: string;
  id: string;
  method: KeychainKeyTypes;
  json: string;
  display_msg: string;
};

export type RequestSignedCall = CommonRequestParams & {
  type: KeychainRequestTypes.signedCall;
  username: string;
  method: string;
  params: string;
  typeWif: KeychainKeyTypes;
};

export type RequestTransfer = CommonRequestParams & {
  type: KeychainRequestTypes.transfer;
  username?: string;
  to: string;
  amount: string;
  memo: string;
  enforce: boolean;
  currency: string;
};

export type RequestSendToken = CommonRequestParams & {
  type: KeychainRequestTypes.sendToken;
  username: string;
  to: string;
  amount: string;
  memo: string;
  currency: string;
};

export type RequestDelegation = CommonRequestParams & {
  type: KeychainRequestTypes.delegation;
  username?: string;
  delegatee: string;
  amount: string;
  unit: string;
};

export type RequestWitnessVote = CommonRequestParams & {
  type: KeychainRequestTypes.witnessVote;
  username?: string;
  witness: string;
  vote: boolean;
};

export type RequestProxy = CommonRequestParams & {
  type: KeychainRequestTypes.proxy;
  username?: string;
  proxy: string;
};

export type RequestPowerUp = CommonRequestParams & {
  type: KeychainRequestTypes.powerUp;
  username: string;
  recipient: string;
  hive: string;
};

export type RequestPowerDown = CommonRequestParams & {
  type: KeychainRequestTypes.powerDown;
  username: string;
  hive_power: string;
};

export type RequestCreateClaimedAccount = CommonRequestParams & {
  type: KeychainRequestTypes.createClaimedAccount;
  username: string;
  new_account: string;
  owner: string;
  active: string;
  posting: string;
  memo: string;
};

export type RequestUpdateProposalVote = CommonRequestParams & {
  type: KeychainRequestTypes.updateProposalVote;
  username?: string;
  proposal_ids: string | number[];
  approve: boolean;
  extensions: string | any[];
};

export type RequestCreateProposal = CommonRequestParams & {
  type: KeychainRequestTypes.createProposal;
  username: string;
  receiver: string;
  subject: string;
  permlink: string;
  start: string;
  end: string;
  daily_pay: string;
  extensions: string;
};

export type RequestRemoveProposal = CommonRequestParams & {
  type: KeychainRequestTypes.removeProposal;
  username: string;
  proposal_ids: string | number[];
  extensions: string;
};

export type RequestAddAccountKeys = {
  posting?: string;
  active?: string;
  memo?: string;
};

export type RequestAddAccount = CommonRequestParams & {
  type: KeychainRequestTypes.addAccount;
  username: string;
  keys: RequestAddAccountKeys;
};

export type RequestConvert = CommonRequestParams & {
  type: KeychainRequestTypes.convert;
  username: string;
  amount: string;
  collaterized: boolean;
};

export type RequestRecurrentTransfer = CommonRequestParams & {
  type: KeychainRequestTypes.recurrentTransfer;
  username?: string;
  to: string;
  amount: string;
  currency: string;
  memo: string;
  recurrence: number;
  executions: number;
};

export type RequestSwap = CommonRequestParams & {
  type: KeychainRequestTypes.swap;
  steps: IStep[];
  slippage: number;
  startToken: string;
  endToken: string;
  amount: number;
  username?: string;
  partnerUsername?: string;
  partnerFee?: number;
};

export type RequestVscCallContract = CommonRequestParams & {
  type: KeychainRequestTypes.vscCallContract;
  username?: string;
  contractId: string;
  action: string;
  payload: object;
  method: KeychainKeyTypes.posting | KeychainKeyTypes.active;
};

export type RequestVscDeposit = CommonRequestParams & {
  type: KeychainRequestTypes.vscDeposit;
  username?: string;
  to?: string;
  amount: string;
  currency: string;
};

export type RequestVscWithdrawal = CommonRequestParams &
  VscRequestParams & {
    type: KeychainRequestTypes.vscWithdrawal;
    username?: string;
    to: string;
    amount: string;
    currency: string;
    memo: string;
  };

export type RequestVscTransfer = CommonRequestParams &
  VscRequestParams & {
    type: KeychainRequestTypes.vscTransfer;
    username?: string;
    to: string;
    amount: string;
    currency: string;
    memo: string;
  };

export type RequestVscStaking = CommonRequestParams &
  VscRequestParams & {
    type: KeychainRequestTypes.vscStaking;
    username?: string;
    to: string;
    amount: string;
    currency: string;
    operation: VscStakingOperation;
  };

export type KeychainRequestData = (
  | RequestDecode
  | RequestEncodeWithKeys
  | RequestEncode
  | RequestSignBuffer
  | RequestBroadcast
  | RequestAddAccountAuthority
  | RequestRemoveAccountAuthority
  | RequestAddKeyAuthority
  | RequestRemoveKeyAuthority
  | RequestSignTx
  | RequestPost
  | RequestVote
  | RequestCustomJSON
  | RequestSignedCall
  | RequestTransfer
  | RequestSendToken
  | RequestDelegation
  | RequestWitnessVote
  | RequestProxy
  | RequestPowerUp
  | RequestPowerDown
  | RequestCreateClaimedAccount
  | RequestUpdateProposalVote
  | RequestCreateProposal
  | RequestRemoveProposal
  | RequestAddAccount
  | RequestConvert
  | RequestRecurrentTransfer
  | RequestSwap
  | RequestVscCallContract
  | RequestVscDeposit
  | RequestVscWithdrawal
  | RequestVscTransfer
  | RequestVscStaking
) & { redirect_uri?: string };

export type RequestId = { request_id: number };

export type KeychainRequest = KeychainRequestData & RequestId;

export type HiveErrorMessage = {
  message: string;
  code: number;
  data?: any;
};

export type RequestSuccess = {
  data: KeychainRequestData;
  request_id: number;
  result: any;
  message: string;
};
export type RequestError = {
  data: KeychainRequestData;
  request_id: number;
  error: any;
  message: string;
};

export type RequestResponse = {
  success: boolean;
  error: any | null;
  result: any | null;
} & (RequestSuccess | RequestError);

export type KeychainRequestWrapper = {
  command: string;
  domain: string;
  request: KeychainRequest;
  request_id: number;
};

export enum LoadingState {
  LOADING,
  LOADED,
  FAILED,
}
