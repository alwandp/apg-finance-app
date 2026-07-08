import { Head } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function TransactionsIndex() {
    return (
        <AppLayout>
            <Head title="Transactions" />
            <div className="p-6 text-foreground">Transactions Index Page (Phase 5 Placeholder)</div>
        </AppLayout>
    );
}
