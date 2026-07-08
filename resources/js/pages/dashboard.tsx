import { Head, Link } from '@inertiajs/react';
import {
    Layers,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Plus,
    BarChart3,
    ArrowRight,
    Calendar,
    DollarSign,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from "@/components/ui/dashboard-card";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Transaction } from '@/types/transaction';

interface DashboardProps {
    summary?: {
        total_accounts: number;
        total_transactions: number;
        total_debit: string;
        total_credit: string;
        is_balanced: boolean;
    };
    recent_transactions?: Transaction[];
}

export default function Dashboard({
    summary = {
        total_accounts: 0,
        total_transactions: 0,
        total_debit: '0.00',
        total_credit: '0.00',
        is_balanced: true,
    },
    recent_transactions = [],
}: DashboardProps) {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: dashboard(),
                },
            ]}
        >
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Financial Overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Real-time double-entry ledger metrics and system
                            equilibrium status.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Link href="/transactions/create">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Record Entry
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <DashboardCard
                       
                        className="space-y-3 border-l-4 border-l-primary p-6"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Chart of Accounts</span>
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div className="font-mono text-3xl font-bold text-foreground">
                                {summary.total_accounts}
                            </div>
                            <Link
                                href="/accounts"
                                className="flex items-center text-xs font-medium text-primary hover:underline"
                            >
                                View Accounts{' '}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active and inactive accounts in hierarchy.
                        </p>
                    </DashboardCard>

                    <DashboardCard
                       
                        className="space-y-3 border-l-4 border-l-blue-500 p-6"
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Total Transactions</span>
                            <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div className="font-mono text-3xl font-bold text-foreground">
                                {summary.total_transactions}
                            </div>
                            <Link
                                href="/transactions"
                                className="flex items-center text-xs font-medium text-blue-500 hover:underline"
                            >
                                View Ledger{' '}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Posted immutable journal entries.
                        </p>
                    </DashboardCard>

                    <DashboardCard
                       
                        className={`space-y-3 border-l-4 p-6 ${
                            summary.is_balanced
                                ? 'border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10'
                                : 'border-l-amber-500 bg-rose-500/5 dark:bg-rose-950/10'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span>Ledger Equilibrium</span>
                            {summary.is_balanced ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            )}
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div
                                className={`font-sans text-xl font-bold ${
                                    summary.is_balanced
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}
                            >
                                {summary.is_balanced
                                    ? 'Balanced ✓'
                                    : 'Out of Balance ✗'}
                            </div>
                            <Link
                                href="/reports/trial-balance"
                                className="flex items-center text-xs font-medium text-primary hover:underline"
                            >
                                Trial Balance{' '}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-1 font-mono text-xs text-muted-foreground">
                            <span>Debits: ${summary.total_debit}</span>
                            <span>Credits: ${summary.total_credit}</span>
                        </div>
                    </DashboardCard>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-foreground">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link href="/accounts/create" className="group">
                            <DashboardCard
                               
                                className="flex items-center gap-3 border-dashed p-4 transition-all hover:bg-white dark:hover:bg-slate-800"
                            >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        New Account
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Add to Chart of Accounts
                                    </div>
                                </div>
                            </DashboardCard>
                        </Link>

                        <Link href="/transactions/create" className="group">
                            <DashboardCard
                               
                                className="flex items-center gap-3 border-dashed p-4 transition-all hover:bg-white dark:hover:bg-slate-800"
                            >
                                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500 transition-transform group-hover:scale-110">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        Record Transaction
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Post double-entry journal
                                    </div>
                                </div>
                            </DashboardCard>
                        </Link>

                        <Link href="/reports/trial-balance" className="group">
                            <DashboardCard
                               
                                className="flex items-center gap-3 border-dashed p-4 transition-all hover:bg-white dark:hover:bg-slate-800"
                            >
                                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500 transition-transform group-hover:scale-110">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        Trial Balance Report
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Inspect ledger balances
                                    </div>
                                </div>
                            </DashboardCard>
                        </Link>
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <DashboardCard className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-base font-semibold text-foreground">
                            Recent Transactions
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <Link href="/transactions">View All →</Link>
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-slate-800 dark:bg-slate-800">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                {recent_transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No transactions recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recent_transactions.map((tx) => {
                                        const totalAmt =
                                            tx.details
                                                ?.filter(
                                                    (d) => d.type === 'debit',
                                                )
                                                .reduce(
                                                    (sum, d) =>
                                                        sum +
                                                        (parseFloat(d.amount) ||
                                                            0),
                                                    0,
                                                ) || 0;

                                        return (
                                            <tr
                                                key={tx.id}
                                                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                <td className="p-4 font-mono text-xs text-muted-foreground">
                                                    #
                                                    {tx.id
                                                        .toString()
                                                        .padStart(5, '0')}
                                                </td>
                                                <td className="p-4 font-mono text-xs whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{tx.date}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-foreground">
                                                    <Link
                                                        href={`/transactions/${tx.id}`}
                                                        className="transition-colors hover:text-primary"
                                                    >
                                                        {tx.description}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-right font-mono font-semibold text-foreground">
                                                    ${totalAmt.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
            </div>
        </AppLayout>
    );
}
