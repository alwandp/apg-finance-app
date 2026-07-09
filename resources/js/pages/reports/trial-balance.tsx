import { Head } from '@inertiajs/react';
import {
    Scale,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Layers,
    Banknote,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { DashboardCard } from "@/components/ui/dashboard-card";
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, getEntryColorClass } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { AccountType } from '@/types/account';
import type { TrialBalanceEntry } from '@/types/transaction';

interface TrialBalanceProps {
    entries: TrialBalanceEntry[];
}

export default function TrialBalancePage({ entries = [] }: TrialBalanceProps) {
    const { totals, grouped, grandDebit, grandCredit, isBalanced } =
        useMemo(() => {
            const groups: Record<AccountType, TrialBalanceEntry[]> = {
                Asset: [],
                Liability: [],
                Equity: [],
                Revenue: [],
                Expense: [],
            };

            let debitSum = 0;
            let creditSum = 0;

            const typeSums: Record<AccountType, number> = {
                Asset: 0,
                Liability: 0,
                Equity: 0,
                Revenue: 0,
                Expense: 0,
            };

            entries.forEach((entry) => {
                const type = entry.account_type as AccountType;

                if (groups[type]) {
                    groups[type].push(entry);
                }

                const d = parseFloat(entry.total_debit.toString()) || 0;
                const c = parseFloat(entry.total_credit.toString()) || 0;
                const b = parseFloat(entry.balance.toString()) || 0;

                debitSum += d;
                creditSum += c;

                if (type === 'Asset' || type === 'Expense') {
                    typeSums[type] += b; // normal debit balance
                } else if (
                    type === 'Liability' ||
                    type === 'Equity' ||
                    type === 'Revenue'
                ) {
                    typeSums[type] += c - d; // normal credit balance
                }
            });

            return {
                totals: typeSums,
                grouped: groups,
                grandDebit: debitSum,
                grandCredit: creditSum,
                isBalanced: Math.abs(debitSum - creditSum) < 0.005,
            };
        }, [entries]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard() },
                { title: 'Reports', href: '/reports/trial-balance' },
                { title: 'Trial Balance', href: '/reports/trial-balance' },
            ]}
        >
            <Head title="Trial Balance Report" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Trial Balance Report
                            </h1>
                            {isBalanced ? (
                                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{' '}
                                    Balanced Ledger
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />{' '}
                                    Out of Balance
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Comprehensive financial summary of all active
                            accounts and double-entry equilibrium.
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <DashboardCard

                        className="space-y-2 border-l-4 border-l-blue-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Assets</span>
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            {formatCurrency(totals.Asset)}
                        </div>
                    </DashboardCard>

                    <DashboardCard

                        className="space-y-2 border-l-4 border-l-amber-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Liabilities</span>
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            {formatCurrency(totals.Liability)}
                        </div>
                    </DashboardCard>

                    <DashboardCard

                        className="space-y-2 border-l-4 border-l-purple-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Equity</span>
                            <Scale className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            {formatCurrency(totals.Equity)}
                        </div>
                    </DashboardCard>

                    <DashboardCard

                        className="space-y-2 border-l-4 border-l-emerald-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Revenue</span>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            {formatCurrency(totals.Revenue)}
                        </div>
                    </DashboardCard>

                    <DashboardCard

                        className="space-y-2 border-l-4 border-l-rose-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Expenses</span>
                            <Banknote className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            {formatCurrency(totals.Expense)}
                        </div>
                    </DashboardCard>
                </div>

                {/* Main Trial Balance Table */}
                <DashboardCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-slate-800 dark:bg-slate-800">
                                    <th className="p-4">Code</th>
                                    <th className="p-4">Account Name</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">
                                        Debit Total
                                    </th>
                                    <th className="p-4 text-right">
                                        Credit Total
                                    </th>
                                    <th className="p-4 text-right">
                                        Net Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                {(Object.keys(grouped) as AccountType[]).map(
                                    (groupType) => {
                                        const accList = grouped[groupType];

                                        if (accList.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <React.Fragment key={groupType}>
                                                <tr className="bg-slate-50 font-bold dark:bg-slate-900">
                                                    <td
                                                        colSpan={6}
                                                        className="px-4 py-2 text-xs tracking-wider text-primary uppercase"
                                                    >
                                                        {groupType} Accounts
                                                    </td>
                                                </tr>
                                                {accList.map((entry) => {
                                                    const d =
                                                        parseFloat(
                                                            entry.total_debit.toString(),
                                                        ) || 0;
                                                    const c =
                                                        parseFloat(
                                                            entry.total_credit.toString(),
                                                        ) || 0;
                                                    const b =
                                                        parseFloat(
                                                            entry.balance.toString(),
                                                        ) || 0;

                                                    return (
                                                        <tr
                                                            key={
                                                                entry.account_id
                                                            }
                                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        >
                                                            <td className="p-4 font-mono font-semibold text-primary">
                                                                {
                                                                    entry.account_code
                                                                }
                                                            </td>
                                                            <td className="p-4 font-medium text-foreground">
                                                                {
                                                                    entry.account_name
                                                                }
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-foreground dark:bg-slate-800">
                                                                    {
                                                                        entry.account_type
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className={`p-4 text-right font-mono ${getEntryColorClass('debit', entry.account_type)}`}>
                                                                {formatCurrency(d)}
                                                            </td>
                                                            <td className={`p-4 text-right font-mono ${getEntryColorClass('credit', entry.account_type)}`}>
                                                                {formatCurrency(c)}
                                                            </td>
                                                            <td className="p-4 text-right font-mono font-semibold text-foreground">
                                                                {formatCurrency(b)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    },
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-200 bg-white font-mono text-sm font-bold dark:border-slate-800 dark:bg-slate-800">
                                    <td
                                        colSpan={3}
                                        className="p-4 text-right font-sans text-xs tracking-wider text-muted-foreground uppercase"
                                    >
                                        Grand Totals & Equilibrium
                                    </td>
                                    <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(grandDebit)}
                                    </td>
                                    <td className="p-4 text-right text-rose-600 dark:text-rose-400">
                                        {formatCurrency(grandCredit)}
                                    </td>
                                    <td className="p-4 text-right">
                                        {isBalanced ? (
                                            <span className="flex items-center justify-end gap-1 font-sans text-xs text-emerald-600 uppercase dark:text-emerald-400">
                                                <CheckCircle2 className="h-4 w-4" />{' '}
                                                Balanced
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-end gap-1 font-sans text-xs text-rose-600 uppercase dark:text-rose-400">
                                                <AlertTriangle className="h-4 w-4" />{' '}
                                                Unbalanced
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </DashboardCard>
            </div>
        </AppLayout>
    );
}
