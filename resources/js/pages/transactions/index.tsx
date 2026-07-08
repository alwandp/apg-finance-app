import { Head, Link, router } from '@inertiajs/react';
import { Plus, Filter, RotateCcw, Eye, Calendar } from 'lucide-react';
import type { FormEventHandler } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Account } from '@/types/account';
import type { Transaction } from '@/types/transaction';

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface TransactionsIndexProps {
    transactions: PaginatedTransactions | Transaction[];
    accounts: Account[];
    filters?: {
        start_date?: string;
        end_date?: string;
        from?: string;
        to?: string;
        account_id?: string | number;
    };
}

export default function TransactionsIndex({
    transactions,
    accounts = [],
    filters = {},
}: TransactionsIndexProps) {
    const txList = Array.isArray(transactions)
        ? transactions
        : transactions?.data || [];
    const paginationLinks =
        !Array.isArray(transactions) && transactions?.links
            ? transactions.links
            : [];

    const initialStart = filters.start_date || filters.from || '';
    const initialEnd = filters.end_date || filters.to || '';
    const initialAcc = filters.account_id
        ? filters.account_id.toString()
        : 'all';

    const [startDate, setStartDate] = useState(initialStart);
    const [endDate, setEndDate] = useState(initialEnd);
    const [accountId, setAccountId] = useState(initialAcc);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};

        if (startDate) {
            params.start_date = startDate;
        }

        if (endDate) {
            params.end_date = endDate;
        }

        if (accountId && accountId !== 'all') {
            params.account_id = accountId;
        }

        router.get('/transactions', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setAccountId('all');
        router.get(
            '/transactions',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const calculateTotalAmount = (tx: Transaction) => {
        if (!tx.details) {
            return 0;
        }

        return tx.details
            .filter((d) => d.type === 'debit')
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard() },
                { title: 'Transactions', href: '/transactions' },
            ]}
        >
            <Head title="Audit Trail & Ledger" />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Audit Trail & Ledger
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Immutable double-entry transaction journal and
                            financial audit trail.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Link href="/transactions/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Record Entry
                        </Link>
                    </Button>
                </div>

                {/* Filters Panel */}
                <GlassCard intensity="low" className="p-4">
                    <form
                        onSubmit={applyFilters}
                        className="grid grid-cols-1 items-end gap-4 md:grid-cols-4"
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="start_date" className="text-xs">
                                Date From
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 bg-white/60 text-sm dark:bg-slate-900/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="end_date" className="text-xs">
                                Date To
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 bg-white/60 text-sm dark:bg-slate-900/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="account_filter" className="text-xs">
                                Filter by Account
                            </Label>
                            <Select
                                value={accountId}
                                onValueChange={setAccountId}
                            >
                                <SelectTrigger className="h-9 bg-white/60 text-sm dark:bg-slate-900/60">
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Accounts
                                    </SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem
                                            key={acc.id}
                                            value={acc.id.toString()}
                                        >
                                            <span className="mr-2 font-mono">
                                                {acc.code}
                                            </span>
                                            <span>{acc.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 w-full"
                            >
                                <Filter className="mr-1.5 h-3.5 w-3.5" />
                                Filter
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="h-9 shrink-0 bg-white/40 dark:bg-slate-800/40"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </form>
                </GlassCard>

                {/* Transactions Table */}
                <GlassCard intensity="medium" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/20 bg-white/30 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-white/10 dark:bg-slate-800/30">
                                    <th className="p-4">Transaction ID</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-center">
                                        Line Items
                                    </th>
                                    <th className="p-4 text-right">
                                        Total Amount
                                    </th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-sm dark:divide-white/5">
                                {txList.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No transactions found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    txList.map((tx) => {
                                        const totalAmt =
                                            calculateTotalAmount(tx);

                                        return (
                                            <tr
                                                key={tx.id}
                                                className="transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                                            >
                                                <td className="p-4 font-mono text-xs font-medium text-muted-foreground">
                                                    #
                                                    {tx.id
                                                        .toString()
                                                        .padStart(5, '0')}
                                                </td>
                                                <td className="p-4 font-mono whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{tx.date}</span>
                                                    </div>
                                                </td>
                                                <td className="max-w-md p-4 font-medium text-foreground">
                                                    {tx.description}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                        {tx.details?.length ||
                                                            0}{' '}
                                                        lines
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-mono font-semibold text-foreground">
                                                    ${totalAmt.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="hover:bg-white/30 dark:hover:bg-slate-800/50"
                                                    >
                                                        <Link
                                                            href={`/transactions/${tx.id}`}
                                                        >
                                                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginationLinks.length > 3 && (
                        <div className="flex items-center justify-between border-t border-white/20 bg-white/20 p-4 dark:border-white/10 dark:bg-slate-900/20">
                            <div className="text-xs text-muted-foreground">
                                Showing page{' '}
                                {Array.isArray(transactions)
                                    ? 1
                                    : transactions.current_page}{' '}
                                of{' '}
                                {Array.isArray(transactions)
                                    ? 1
                                    : transactions.last_page}
                            </div>
                            <div className="flex items-center gap-1">
                                {paginationLinks.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    { preserveState: true },
                                                );
                                            }
                                        }}
                                        className={`h-8 px-3 text-xs ${
                                            !link.active &&
                                            'bg-white/40 dark:bg-slate-800/40'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
