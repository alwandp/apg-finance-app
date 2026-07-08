import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Save,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { Account, AccountType } from '@/types/account';
import type { TransactionEntryType } from '@/types/transaction';

interface TransactionsCreateProps {
    accounts: Account[];
}

interface DetailRow {
    account_id: number | '';
    type: TransactionEntryType;
    amount: string;
}

export default function TransactionsCreate({
    accounts = [],
}: TransactionsCreateProps) {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    const { data, setData, post, processing, errors } = useForm<{
        date: string;
        description: string;
        details: DetailRow[];
    }>({
        date: today,
        description: '',
        details: [
            { account_id: '', type: 'debit', amount: '' },
            { account_id: '', type: 'credit', amount: '' },
        ],
    });

    const groupedAccounts = useMemo(() => {
        const groups: Record<AccountType, Account[]> = {
            Asset: [],
            Liability: [],
            Equity: [],
            Revenue: [],
            Expense: [],
        };
        accounts.forEach((acc) => {
            if (groups[acc.type]) {
                groups[acc.type].push(acc);
            }
        });

        return groups;
    }, [accounts]);

    const totalDebit = useMemo(() => {
        return data.details
            .filter((row) => row.type === 'debit')
            .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
    }, [data.details]);

    const totalCredit = useMemo(() => {
        return data.details
            .filter((row) => row.type === 'credit')
            .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
    }, [data.details]);

    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = totalDebit > 0 && totalCredit > 0 && difference < 0.005;

    const addRow = () => {
        setData('details', [
            ...data.details,
            { account_id: '', type: 'debit', amount: '' },
        ]);
    };

    const removeRow = (index: number) => {
        if (data.details.length <= 2) {
            toast.error('A journal entry must have at least 2 line items.');

            return;
        }

        setData(
            'details',
            data.details.filter((_, i) => i !== index),
        );
    };

    const updateRow = (index: number, field: keyof DetailRow, value: any) => {
        const updated = [...data.details];
        updated[index] = { ...updated[index], [field]: value };
        setData('details', updated);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!isBalanced) {
            toast.error('Total debits must equal total credits before saving.');

            return;
        }

        post('/transactions', {
            onSuccess: () => {
                toast.success('Journal entry recorded successfully!');
            },
            onError: () => {
                toast.error('Please fix the validation errors below.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard() },
                { title: 'Transactions', href: '/transactions' },
                { title: 'New Journal Entry', href: '/transactions/create' },
            ]}
        >
            <Head title="Record Journal Entry" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Record Journal Entry
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a balanced double-entry transaction.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/transactions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Ledger
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <DashboardCard className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="date">Transaction Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    required
                                    className="bg-white dark:bg-slate-800"
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="e.g., Office equipment purchase via check #1042"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    required
                                    className="bg-white dark:bg-slate-800"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-foreground">
                                    Line Items (Debit & Credit)
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addRow}
                                    className="bg-white dark:bg-slate-800"
                                >
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Add Line
                                </Button>
                            </div>

                            {errors.details &&
                                typeof errors.details === 'string' && (
                                    <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
                                        {errors.details}
                                    </div>
                                )}

                            <div className="space-y-3">
                                {data.details.map((row, idx) => {
                                    const accError = (errors as any)[
                                        `details.${idx}.account_id`
                                    ];
                                    const amountError = (errors as any)[
                                        `details.${idx}.amount`
                                    ];

                                    return (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800"
                                        >
                                            <div className="col-span-12 space-y-1 md:col-span-6">
                                                <Label className="text-xs text-muted-foreground md:hidden">
                                                    Account
                                                </Label>
                                                <Select
                                                    value={
                                                        row.account_id
                                                            ? row.account_id.toString()
                                                            : ''
                                                    }
                                                    onValueChange={(val) =>
                                                        updateRow(
                                                            idx,
                                                            'account_id',
                                                            Number(val),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-slate-900">
                                                        <SelectValue placeholder="Select account..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(
                                                            Object.keys(
                                                                groupedAccounts,
                                                            ) as AccountType[]
                                                        ).map((groupType) => {
                                                            const group =
                                                                groupedAccounts[
                                                                groupType
                                                                ];

                                                            if (
                                                                group.length ===
                                                                0
                                                            ) {
                                                                return null;
                                                            }

                                                            return (
                                                                <SelectGroup
                                                                    key={
                                                                        groupType
                                                                    }
                                                                >
                                                                    <SelectLabel className="px-2 py-1.5 text-xs font-bold text-primary uppercase">
                                                                        {
                                                                            groupType
                                                                        }
                                                                    </SelectLabel>
                                                                    {group.map(
                                                                        (
                                                                            acc,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    acc.id
                                                                                }
                                                                                value={acc.id.toString()}
                                                                            >
                                                                                <span className="mr-2 font-mono font-medium">
                                                                                    {
                                                                                        acc.code
                                                                                    }
                                                                                </span>
                                                                                <span>
                                                                                    {
                                                                                        acc.name
                                                                                    }
                                                                                </span>
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectGroup>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={accError}
                                                />
                                            </div>

                                            <div className="col-span-6 space-y-1 md:col-span-3">
                                                <Label className="text-xs text-muted-foreground md:hidden">
                                                    Type
                                                </Label>
                                                <Select
                                                    value={row.type}
                                                    onValueChange={(
                                                        val: TransactionEntryType,
                                                    ) =>
                                                        updateRow(
                                                            idx,
                                                            'type',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-slate-900">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="debit"
                                                            className="font-medium text-emerald-600"
                                                        >
                                                            Debit
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="credit"
                                                            className="font-medium text-rose-600"
                                                        >
                                                            Credit
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="col-span-5 space-y-1 md:col-span-2">
                                                <Label className="text-xs text-muted-foreground md:hidden">
                                                    Amount
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    value={row.amount}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            idx,
                                                            'amount',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="bg-white text-right font-mono font-semibold dark:bg-slate-900"
                                                />
                                                <InputError
                                                    message={amountError}
                                                />
                                            </div>

                                            <div className="col-span-1 flex justify-end pt-1 md:col-span-1 md:pt-0">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeRow(idx)
                                                    }
                                                    disabled={
                                                        data.details.length <= 2
                                                    }
                                                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Live Balance Summary Panel */}
                    <DashboardCard

                        className={`p-5 transition-colors duration-300 ${isBalanced
                            ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20'
                            : 'border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/20'
                            }`}
                    >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                {isBalanced ? (
                                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />
                                )}
                                <div>
                                    <h4 className="font-semibold text-foreground">
                                        {isBalanced
                                            ? 'Journal Entry is Balanced'
                                            : 'Journal Entry Unbalanced'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isBalanced
                                            ? 'Debits and credits equal precisely.'
                                            : `Debits must equal credits. Current variance: ${formatCurrency(difference)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 font-mono text-sm">
                                <div className="text-right">
                                    <div className="font-sans text-xs font-semibold text-muted-foreground uppercase">
                                        Total Debit
                                    </div>
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(totalDebit)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-sans text-xs font-semibold text-muted-foreground uppercase">
                                        Total Credit
                                    </div>
                                    <div className="font-bold text-rose-600 dark:text-rose-400">
                                        {formatCurrency(totalCredit)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="bg-white dark:bg-slate-800"
                        >
                            <Link href="/transactions">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Record Transaction
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
