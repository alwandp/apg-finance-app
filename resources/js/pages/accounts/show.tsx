import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    FolderTree,
    History,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, getEntryBadgeClass, getEntryColorClass, getEntrySign } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { Account, AccountType } from '@/types/account';

interface AccountsShowProps {
    account: Account;
}

const getTypeBadgeStyles = (type: AccountType) => {
    switch (type) {
        case 'Asset':
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        case 'Liability':
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        case 'Equity':
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case 'Revenue':
            return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
        case 'Expense':
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        default:
            return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
};

export default function AccountsShow({ account }: AccountsShowProps) {
    const transactionDetails = account.transaction_details || account.transactionDetails || [];
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        setIsDeleting(true);

        router.delete(`/accounts/${account.id}`, {
            onSuccess: () => {
                toast.success('Account deleted successfully.');
                setIsDeleteDialogOpen(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error(
                    errors.error ||
                    'Cannot delete account because it has child accounts attached.',
                );
                setIsDeleteDialogOpen(false);
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: dashboard(),
                },
                {
                    title: 'Chart of Accounts',
                    href: '/accounts',
                },
                {
                    title: `${account.code} - ${account.name}`,
                    href: `/accounts/${account.id}`,
                },
            ]}
        >
            <Head
                title={`${account.code} - ${account.name} | Account Details`}
            />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-9 hover:bg-slate-50 dark:hover:bg-slate-100"
                        >
                            <Link href="/accounts" title="Back to accounts">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-2xl font-bold tracking-tight text-primary/90 sm:text-3xl dark:text-primary/90">
                                    {account.code}
                                </span>
                                <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {account.name}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Detailed view of general ledger account
                                properties and children.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="hover:bg-slate-50 dark:hover:bg-slate-100"
                        >
                            <Link href={`/accounts/${account.id}/edit`}>
                                <Edit2 className="mr-2 size-4" />
                                Edit Account
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <DashboardCard className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Account Overview
                            </h2>
                            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Account Code
                                    </dt>
                                    <dd className="mt-1 font-mono text-base font-bold text-foreground">
                                        {account.code}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Account Name
                                    </dt>
                                    <dd className="mt-1 text-base font-medium text-foreground">
                                        {account.name}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Category Type
                                    </dt>
                                    <dd className="mt-1">
                                        <Badge
                                            variant="outline"
                                            className={getTypeBadgeStyles(
                                                account.type,
                                            )}
                                        >
                                            {account.type}
                                        </Badge>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Active Status
                                    </dt>
                                    <dd className="mt-1 flex items-center gap-1.5">
                                        {account.is_active ? (
                                            <>
                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                    Active
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="size-4 text-muted-foreground" />
                                                <span className="font-medium text-muted-foreground">
                                                    Inactive
                                                </span>
                                            </>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Parent Account
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {account.parent ? (
                                            <Link
                                                href={`/accounts/${account.parent.id}`}
                                                className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                                            >
                                                [{account.parent.code}]{' '}
                                                <span className="font-sans text-foreground">
                                                    {account.parent.name}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                None (Root Level Account)
                                            </span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Hierarchy Level
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {account.parent
                                            ? 'Child Node'
                                            : 'Root Category'}
                                    </dd>
                                </div>
                            </dl>
                        </DashboardCard>

                        <DashboardCard className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <History className="size-5 text-primary/80" />
                                <h2 className="text-lg font-semibold text-foreground">
                                    Recent Transaction History
                                </h2>
                            </div>
                            {transactionDetails.length === 0 ? (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
                                    <p className="text-sm font-medium text-foreground">
                                        No double-entry transactions recorded yet.
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Any journal entries or double-entry transactions posted to this account will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/75 font-sans text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-slate-800 dark:bg-slate-900/50">
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Journal #</th>
                                                <th className="p-3">Description</th>
                                                <th className="p-3">Type</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {transactionDetails.map((detail) => {
                                                const tx = detail.transaction;

                                                return (
                                                    <tr
                                                        key={detail.id}
                                                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                                    >
                                                        <td className="p-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                                                            {tx?.date
                                                                ? new Date(tx.date).toLocaleDateString('id-ID', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })
                                                                : '—'}
                                                        </td>
                                                        <td className="p-3 font-mono text-xs font-medium text-foreground">
                                                            {tx ? (
                                                                <Link
                                                                    href={`/transactions/${tx.id}`}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    #{tx.id}
                                                                </Link>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>
                                                        <td className="p-3 font-medium text-foreground">
                                                            {tx?.description || 'Transaction Entry'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${getEntryBadgeClass(detail.type, account.type)}`}
                                                            >
                                                                {detail.type}
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={`p-3 text-right font-mono font-semibold ${getEntryColorClass(detail.type, account.type)}`}
                                                        >
                                                            {getEntrySign(detail.type, account.type)}{formatCurrency(detail.amount)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    <div className="space-y-6">
                        <DashboardCard className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <FolderTree className="size-5 text-primary/80" />
                                <h2 className="text-lg font-semibold text-foreground">
                                    Child Accounts (
                                    {account.children?.length ?? 0})
                                </h2>
                            </div>

                            {!account.children ||
                                account.children.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">
                                    No sub-accounts exist under this account
                                    node.
                                </p>
                            ) : (
                                <ul className="divide-y divide-border/30">
                                    {account.children.map((child) => (
                                        <li
                                            key={child.id}
                                            className="flex items-center justify-between py-3 pr-1"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-primary/90">
                                                    [{child.code}]
                                                </span>
                                                <Link
                                                    href={`/accounts/${child.id}`}
                                                    className="text-sm font-medium text-foreground hover:underline"
                                                >
                                                    {child.name}
                                                </Link>
                                            </div>
                                            <Badge
                                                variant={
                                                    child.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-[10px]"
                                            >
                                                {child.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DashboardCard>

                        <DashboardCard className="p-6">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider text-foreground uppercase">
                                Metadata & Timestamps
                            </h2>
                            <ul className="space-y-3 text-xs text-muted-foreground">
                                <li className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        Created On
                                    </span>
                                    <span className="font-mono font-medium text-foreground">
                                        {new Date(
                                            account.created_at,
                                        ).toLocaleDateString()}{' '}
                                        {new Date(
                                            account.created_at,
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        Last Modified
                                    </span>
                                    <span className="font-mono font-medium text-foreground">
                                        {new Date(
                                            account.updated_at,
                                        ).toLocaleDateString()}{' '}
                                        {new Date(
                                            account.updated_at,
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </li>
                            </ul>
                        </DashboardCard>
                    </div>
                </div>

                <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the account{' '}
                                <span className="font-semibold text-foreground">
                                    {account.code} - {account.name}
                                </span>
                                ? This action cannot be undone and will fail if
                                any child accounts exist under this node.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
