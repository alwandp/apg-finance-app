import type { Account, AccountType } from './account';

export type TransactionEntryType = 'debit' | 'credit';

export type TransactionDetail = {
    id: number;
    transaction_id: number;
    account_id: number;
    type: TransactionEntryType;
    amount: string;
    account?: Account;
    transaction?: Transaction;
};

export type Transaction = {
    id: number;
    date: string;
    description: string;
    created_at: string;
    updated_at: string;
    details?: TransactionDetail[];
};

export type TrialBalanceEntry = {
    account_id: number;
    account_code: string;
    account_name: string;
    account_type: AccountType;
    total_debit: string | number;
    total_credit: string | number;
    balance: string | number;
};
