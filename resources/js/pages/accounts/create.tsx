import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEventHandler } from 'react';
import React from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/glass-card';
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

interface AccountsCreateProps {
    parents: Account[];
    types: AccountType[];
}

export default function AccountsCreate({
    parents = [],
    types = [],
}: AccountsCreateProps) {
    const { data, setData, post, processing, errors } = useForm<{
        parent_id: number | null;
        name: string;
        type: AccountType;
        is_active: boolean;
    }>({
        parent_id: null,
        name: '',
        type: 'Asset',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/accounts', {
            onSuccess: () => {
                toast.success('Account created successfully.');
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
                    title: 'New Account',
                    href: '/accounts/create',
                },
            ]}
        >
            <Head title="Create Account - Chart of Accounts" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-9 hover:bg-white/20 dark:hover:bg-white/10"
                    >
                        <Link href="/accounts" title="Back to accounts">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Create New Account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a general ledger account to your accounting
                            structure.
                        </p>
                    </div>
                </div>

                <GlassCard intensity="medium" className="p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
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
                                    className="bg-white/50 dark:bg-slate-900/50"
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
                            <p className="text-xs text-muted-foreground">
                                Selecting a parent account will inherit its
                                category type automatically.
                            </p>
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
                                className="bg-white/50 dark:bg-slate-900/50"
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
                                    className="bg-white/50 dark:bg-slate-900/50"
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
                                Determines how transactions under this account
                                affect balance sheets and income statements.
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
                                    recording new double-entry journal items.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-6">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="hover:bg-white/20 dark:hover:bg-white/10"
                            >
                                <Link href="/accounts">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-primary shadow-sm hover:bg-primary/90"
                            >
                                <Save className="mr-2 size-4" />
                                {processing ? 'Saving...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
