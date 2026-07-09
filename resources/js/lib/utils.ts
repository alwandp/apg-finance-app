import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: num % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(num);
}

import type { AccountType } from '@/types/account';
import type { TransactionEntryType } from '@/types/transaction';

/**
 * Returns the semantic Tailwind text-color class based on accounting rules.
 *
 * - For Asset/Expense accounts: debit = increase (emerald), credit = decrease (rose)
 * - For Revenue/Liability/Equity accounts: credit = increase (emerald), debit = decrease (rose)
 */
export function getEntryColorClass(
    entryType: TransactionEntryType,
    accountType?: AccountType | string,
): string {
    const POSITIVE = 'text-emerald-600 dark:text-emerald-400';
    const NEGATIVE = 'text-rose-600 dark:text-rose-400';

    if (!accountType) {
        return entryType === 'debit' ? POSITIVE : NEGATIVE;
    }

    const isNaturalDebit = accountType === 'Asset' || accountType === 'Expense';

    if (isNaturalDebit) {
        return entryType === 'debit' ? POSITIVE : NEGATIVE;
    }

    return entryType === 'credit' ? POSITIVE : NEGATIVE;
}

/**
 * Returns the semantic Tailwind badge class (bg + text) based on accounting rules.
 */
export function getEntryBadgeClass(
    entryType: TransactionEntryType,
    accountType?: AccountType | string,
): string {
    const POSITIVE = 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
    const NEGATIVE = 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400';

    if (!accountType) {
        return entryType === 'debit' ? POSITIVE : NEGATIVE;
    }

    const isNaturalDebit = accountType === 'Asset' || accountType === 'Expense';

    if (isNaturalDebit) {
        return entryType === 'debit' ? POSITIVE : NEGATIVE;
    }

    return entryType === 'credit' ? POSITIVE : NEGATIVE;
}

/**
 * Returns the sign prefix (+/-) based on accounting rules.
 */
export function getEntrySign(
    entryType: TransactionEntryType,
    accountType?: AccountType | string,
): string {
    if (!accountType) {
        return entryType === 'debit' ? '+' : '-';
    }

    const isNaturalDebit = accountType === 'Asset' || accountType === 'Expense';

    if (isNaturalDebit) {
        return entryType === 'debit' ? '+' : '-';
    }

    return entryType === 'credit' ? '+' : '-';
}

