import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Edit2,
    Eye,
    FolderPlus,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Account, AccountType } from '@/types/account';

interface AccountsIndexProps {
    accounts: Account[];
    allAccounts: Account[];
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

const AccountTreeItem: React.FC<{
    account: Account;
    level?: number;
    onDelete: (account: Account) => void;
    searchTerm: string;
}> = ({ account, level = 0, onDelete, searchTerm }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = account.children && account.children.length > 0;

    const matchesSearch = (acc: Account): boolean => {
        if (!searchTerm) {
            return true;
        }

        const term = searchTerm.toLowerCase();

        if (
            acc.code.toLowerCase().includes(term) ||
            acc.name.toLowerCase().includes(term) ||
            acc.type.toLowerCase().includes(term)
        ) {
            return true;
        }

        return (acc.children ?? []).some(matchesSearch);
    };

    if (searchTerm && !matchesSearch(account)) {
        return null;
    }

    return (
        <div className="w-full">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full"
            >
                <div
                    className="flex items-center justify-between border-b border-border/40 py-3 pr-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{ paddingLeft: `${level * 1.75 + 1}rem` }}
                >
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 p-0 text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-100"
                                >
                                    {isOpen ? (
                                        <ChevronDown className="size-4" />
                                    ) : (
                                        <ChevronRight className="size-4" />
                                    )}
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        ) : (
                            <div className="size-6 shrink-0" />
                        )}

                        <span className="font-mono text-sm font-semibold text-primary/90 dark:text-primary/90">
                            {account.code}
                        </span>

                        <span className="text-sm font-medium text-foreground">
                            {account.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-12">
                        <Badge
                            variant="outline"
                            className={getTypeBadgeStyles(account.type)}
                        >
                            {account.type}
                        </Badge>

                        <Badge
                            variant={
                                account.is_active ? 'default' : 'secondary'
                            }
                            className={
                                account.is_active
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-muted text-muted-foreground'
                            }
                        >
                            {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>

                        <div className="flex items-center gap-1">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="size-8 hover:bg-slate-50 dark:hover:bg-slate-100"
                            >
                                <Link
                                    href={`/accounts/${account.id}`}
                                    title="View details"
                                >
                                    <Eye className="size-4 text-muted-foreground" />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="size-8 hover:bg-slate-50 dark:hover:bg-slate-100"
                            >
                                <Link
                                    href={`/accounts/${account.id}/edit`}
                                    title="Edit account"
                                >
                                    <Edit2 className="size-4 text-muted-foreground" />
                                </Link>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                onClick={() => onDelete(account)}
                                title="Delete account"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {hasChildren && (
                    <CollapsibleContent className="w-full">
                        {account.children!.map((child) => (
                            <AccountTreeItem
                                key={child.id}
                                account={child}
                                level={level + 1}
                                onDelete={onDelete}
                                searchTerm={searchTerm}
                            />
                        ))}
                    </CollapsibleContent>
                )}
            </Collapsible>
        </div>
    );
};

export default function AccountsIndex({ accounts = [] }: AccountsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        if (!deletingAccount) {
            return;
        }

        setIsDeleting(true);

        router.delete(`/accounts/${deletingAccount.id}`, {
            onSuccess: () => {
                toast.success('Account deleted successfully.');
                setDeletingAccount(null);
                setIsDeleting(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error(
                    errors.error ||
                    'Cannot delete account because it has child accounts attached.',
                );
                setDeletingAccount(null);
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
            ]}
        >
            <Head title="Chart of Accounts" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Chart of Accounts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage hierarchical financial general ledger
                            accounts and codes.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="bg-primary shadow-sm hover:bg-primary/90"
                    >
                        <Link href="/accounts/create">
                            <Plus className="mr-2 size-4" />
                            New Account
                        </Link>
                    </Button>
                </div>

                <DashboardCard className="p-4">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by code, account name, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white pl-9 dark:bg-slate-900"
                        />
                    </div>
                </DashboardCard>

                <DashboardCard className="overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-border/60 bg-slate-50 px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:bg-slate-900">
                        <div>Account Hierarchy</div>
                        <div className="flex items-center gap-12 pr-16">
                            <span>Type</span>
                            <span>Status</span>
                            <span className="w-12 text-center">Actions</span>
                        </div>
                    </div>

                    <div className="divide-y divide-border/20">
                        {accounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <FolderPlus className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-foreground">
                                        No Accounts Found
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get started by creating your first root
                                        general ledger account.
                                    </p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/accounts/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Add Root Account
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            accounts.map((account) => (
                                <AccountTreeItem
                                    key={account.id}
                                    account={account}
                                    onDelete={(acc) => setDeletingAccount(acc)}
                                    searchTerm={searchTerm}
                                />
                            ))
                        )}
                    </div>
                </DashboardCard>

                <Dialog
                    open={deletingAccount !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeletingAccount(null);
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the account{' '}
                                <span className="font-semibold text-foreground">
                                    {deletingAccount?.code} -{' '}
                                    {deletingAccount?.name}
                                </span>
                                ? This action cannot be undone and will fail if
                                any child accounts exist under this node.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingAccount(null)}
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
