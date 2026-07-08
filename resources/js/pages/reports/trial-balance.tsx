import { Head } from '@inertiajs/react';
import {
    Scale,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Layers,
    DollarSign,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/layouts/app-layout';
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

            <div className="mx-auto max-w-7xl space-y-6 p-6">
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
                                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
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
                    <GlassCard
                        intensity="low"
                        className="space-y-2 border-l-4 border-l-blue-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Assets</span>
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            ${totals.Asset.toFixed(2)}
                        </div>
                    </GlassCard>

                    <GlassCard
                        intensity="low"
                        className="space-y-2 border-l-4 border-l-amber-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Liabilities</span>
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            ${totals.Liability.toFixed(2)}
                        </div>
                    </GlassCard>

                    <GlassCard
                        intensity="low"
                        className="space-y-2 border-l-4 border-l-purple-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Equity</span>
                            <Scale className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            ${totals.Equity.toFixed(2)}
                        </div>
                    </GlassCard>

                    <GlassCard
                        intensity="low"
                        className="space-y-2 border-l-4 border-l-emerald-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Revenue</span>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            ${totals.Revenue.toFixed(2)}
                        </div>
                    </GlassCard>

                    <GlassCard
                        intensity="low"
                        className="space-y-2 border-l-4 border-l-rose-500 p-4"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Expenses</span>
                            <DollarSign className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="font-mono text-xl font-bold text-foreground">
                            ${totals.Expense.toFixed(2)}
                        </div>
                    </GlassCard>
                </div>

                {/* Main Trial Balance Table */}
                <GlassCard intensity="medium" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/20 bg-white/30 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-white/10 dark:bg-slate-800/30">
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
                            <tbody className="divide-y divide-white/10 text-sm dark:divide-white/5">
                                {(Object.keys(grouped) as AccountType[]).map(
                                    (groupType) => {
                                        const accList = grouped[groupType];

                                        if (accList.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <React.Fragment key={groupType}>
                                                <tr className="bg-white/15 font-bold dark:bg-slate-800/20">
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
                                                            className="transition-colors hover:bg-white/20 dark:hover:bg-white/5"
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
                                                                <span className="rounded bg-white/40 px-2 py-0.5 text-xs font-semibold text-foreground dark:bg-slate-800/40">
                                                                    {
                                                                        entry.account_type
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                                                ${d.toFixed(2)}
                                                            </td>
                                                            <td className="p-4 text-right font-mono text-amber-600 dark:text-amber-400">
                                                                ${c.toFixed(2)}
                                                            </td>
                                                            <td className="p-4 text-right font-mono font-semibold text-foreground">
                                                                ${b.toFixed(2)}
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
                                <tr className="border-t-2 border-white/30 bg-white/40 font-mono text-sm font-bold dark:border-white/20 dark:bg-slate-800/40">
                                    <td
                                        colSpan={3}
                                        className="p-4 text-right font-sans text-xs tracking-wider text-muted-foreground uppercase"
                                    >
                                        Grand Totals & Equilibrium
                                    </td>
                                    <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">
                                        ${grandDebit.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right text-amber-600 dark:text-amber-400">
                                        ${grandCredit.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right">
                                        {isBalanced ? (
                                            <span className="flex items-center justify-end gap-1 font-sans text-xs text-emerald-600 uppercase dark:text-emerald-400">
                                                <CheckCircle2 className="h-4 w-4" />{' '}
                                                Balanced
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-end gap-1 font-sans text-xs text-amber-600 uppercase dark:text-amber-400">
                                                <AlertTriangle className="h-4 w-4" />{' '}
                                                Unbalanced
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
