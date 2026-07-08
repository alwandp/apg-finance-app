export type AccountType =
    'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export type Account = {
    id: number;
    parent_id: number | null;
    code: string;
    name: string;
    type: AccountType;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    children?: Account[];
    parent?: Account;
};
