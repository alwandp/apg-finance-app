import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Transaction } from '@/types/transaction';

interface TransactionsShowProps {
    transaction: Transaction;
}

export default function TransactionsShow({
    transaction,
}: TransactionsShowProps) {
    const totalDebit = useMemo(() => {
        if (!transaction.details) {
            return 0;
        }

        return transaction.details
            .filter((d) => d.type === 'debit')
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    }, [transaction.details]);

    const totalCredit = useMemo(() => {
        if (!transaction.details) {
            return 0;
        }

        return transaction.details
            .filter((d) => d.type === 'credit')
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    }, [transaction.details]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard() },
                { title: 'Transactions', href: '/transactions' },
                {
                    title: `Journal #${transaction.id}`,
                    href: `/transactions/${transaction.id}`,
                },
            ]}
        >
            <Head title={`Journal Entry #${transaction.id}`} />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Journal Entry #
                                {transaction.id.toString().padStart(5, '0')}
                            </h1>
                            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{' '}
                                Posted
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Immutable double-entry record verified and balanced.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-white/40 dark:bg-slate-800/40"
                    >
                        <Link href="/transactions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Ledger
                        </Link>
                    </Button>
                </div>

                <GlassCard intensity="medium" className="space-y-6 p-6">
                    <div className="grid grid-cols-1 gap-6 rounded-xl border border-white/20 bg-white/40 p-4 md:grid-cols-2 dark:border-white/10 dark:bg-slate-800/40">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                <Calendar className="h-3.5 w-3.5" /> Transaction
                                Date
                            </div>
                            <div className="font-mono text-lg font-bold text-foreground">
                                {transaction.date}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                <FileText className="h-3.5 w-3.5" /> Description
                            </div>
                            <div className="text-base font-medium text-foreground">
                                {transaction.description}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-base font-semibold text-foreground">
                            Journal Line Items
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-white/20 dark:border-white/10">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-white/20 bg-white/30 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-white/10 dark:bg-slate-800/30">
                                        <th className="p-4">Account Code</th>
                                        <th className="p-4">Account Name</th>
                                        <th className="p-4 text-right">
                                            Debit
                                        </th>
                                        <th className="p-4 text-right">
                                            Credit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 text-sm dark:divide-white/5">
                                    {transaction.details?.map((item) => {
                                        const amt =
                                            parseFloat(item.amount) || 0;
                                        const isDebit = item.type === 'debit';

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-white/10 dark:hover:bg-white/5"
                                            >
                                                <td className="p-4 font-mono font-semibold text-primary">
                                                    {item.account?.code ||
                                                        'N/A'}
                                                </td>
                                                <td className="p-4 font-medium text-foreground">
                                                    {item.account?.name ||
                                                        'Unknown Account'}
                                                </td>
                                                <td className="p-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {isDebit
                                                        ? `$${amt.toFixed(2)}`
                                                        : '—'}
                                                </td>
                                                <td className="p-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                                                    {!isDebit
                                                        ? `$${amt.toFixed(2)}`
                                                        : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-white/30 bg-white/40 font-mono text-sm font-bold dark:border-white/20 dark:bg-slate-800/40">
                                        <td
                                            colSpan={2}
                                            className="p-4 text-right font-sans text-xs tracking-wider text-muted-foreground uppercase"
                                        >
                                            Total Equilibrium
                                        </td>
                                        <td className="p-4 text-right text-emerald-600 dark:text-emerald-400">
                                            ${totalDebit.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right text-amber-600 dark:text-amber-400">
                                            ${totalCredit.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
