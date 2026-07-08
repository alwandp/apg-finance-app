import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEventHandler } from 'react';
import React from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Account, AccountType } from '@/types/account';

interface AccountsEditProps {
    account: Account;
    parents: Account[];
    types: AccountType[];
}

export default function AccountsEdit({
    account,
    parents = [],
    types = [],
}: AccountsEditProps) {
    const { data, setData, put, processing, errors } = useForm<{
        parent_id: number | null;
        name: string;
        type: AccountType;
        is_active: boolean;
    }>({
        parent_id: account.parent_id,
        name: account.name,
        type: account.type,
        is_active: account.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/accounts/${account.id}`, {
            onSuccess: () => {
                toast.success('Account updated successfully.');
            },
            onError: () => {
                toast.error('Please check the form fields for errors.');
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
                {
                    title: 'Edit',
                    href: `/accounts/${account.id}/edit`,
                },
            ]}
        >
            <Head title={`Edit Account ${account.code} - Chart of Accounts`} />

            <div className="flex flex-col gap-6 p-6">
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
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Edit Account [{account.code}]
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update account name, parent node, category type, or
                            active status.
                        </p>
                    </div>
                </div>

                <DashboardCard className="p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Account Code</Label>
                            <Input
                                id="code"
                                type="text"
                                value={account.code}
                                disabled
                                className="cursor-not-allowed bg-muted/60 font-mono text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">
                                Account codes are auto-generated from hierarchy
                                structure and cannot be modified directly after
                                creation.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent_id">
                                Parent Account (Optional)
                            </Label>
                            <Select
                                value={
                                    data.parent_id !== null
                                        ? String(data.parent_id)
                                        : 'none'
                                }
                                onValueChange={(val) => {
                                    const newParentId =
                                        val === 'none' ? null : Number(val);
                                    setData('parent_id', newParentId);

                                    if (newParentId !== null) {
                                        const selectedParent = parents.find(
                                            (p) => p.id === newParentId,
                                        );

                                        if (selectedParent) {
                                            setData(
                                                'type',
                                                selectedParent.type,
                                            );
                                        }
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="parent_id"
                                    className="bg-white dark:bg-slate-900"
                                >
                                    <SelectValue placeholder="Select parent account (or leave as root)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="font-semibold text-muted-foreground">
                                            None (Root Account)
                                        </span>
                                    </SelectItem>
                                    <SelectGroup>
                                        {parents.map((parent) => (
                                            <SelectItem
                                                key={parent.id}
                                                value={String(parent.id)}
                                            >
                                                <span className="font-mono text-primary/80">
                                                    [{parent.code}]
                                                </span>{' '}
                                                {parent.name} ({parent.type})
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Account Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="e.g., Cash on Hand, Accounts Receivable"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                className="bg-white dark:bg-slate-900"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Account Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(val) =>
                                    setData('type', val as AccountType)
                                }
                            >
                                <SelectTrigger
                                    id="type"
                                    className="bg-white dark:bg-slate-900"
                                >
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Note: Changing an account type is restricted if
                                transactions have already been recorded against
                                it.
                            </p>
                            <InputError message={errors.type} />
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', Boolean(checked))
                                }
                            />
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="is_active"
                                    className="cursor-pointer font-medium"
                                >
                                    Active Account
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive accounts cannot be selected when
                                    recording new journal entries.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-6">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="hover:bg-slate-50 dark:hover:bg-slate-100"
                            >
                                <Link href="/accounts">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-primary shadow-sm hover:bg-primary/90"
                            >
                                <Save className="mr-2 size-4" />
                                {processing ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </DashboardCard>
            </div>
        </AppLayout>
    );
}
