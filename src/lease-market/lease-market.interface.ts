export interface CancelRequestJSON {
  leaseId: string;
}

export interface CancelDelegationJSON {
  leaseId: string;
}

export interface RequestCancelRequestJSON {
  leaseId: string;
}

export interface AcceptRequestJSON {
  leaseId: string;
  token: string;
}

export interface RequestJSON {
  key: string;
  id: string;
  delegationValue: number;
  weeklyPay: string;
  weeklyPayCurrency: string;
  duration: string;
  totalCost: string;
}

export interface ReimbursmentJSON {
  leaseId: string;
}

export interface PaymentJSON {
  paymentNumber: string;
}

export interface LeaseLockResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface LockLeaseData {
  signedMessage: string;
  username: string;
  leaseId: string;
}
