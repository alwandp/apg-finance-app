<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the Trial Balance report.
     */
    public function trialBalance(): Response
    {
        $entries = Account::query()
            ->where('is_active', true)
            ->withSum(['transactionDetails as total_debit' => fn (Builder $q) => $q->where('type', 'debit')], 'amount')
            ->withSum(['transactionDetails as total_credit' => fn (Builder $q) => $q->where('type', 'credit')], 'amount')
            ->orderBy('code')
            ->get()
            ->map(function (Account $account): array {
                $debit = (float) ($account->total_debit ?? 0);
                $credit = (float) ($account->total_credit ?? 0);

                return [
                    'account_id' => $account->id,
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'account_type' => $account->type->value,
                    'total_debit' => number_format($debit, 2, '.', ''),
                    'total_credit' => number_format($credit, 2, '.', ''),
                    'balance' => number_format($debit - $credit, 2, '.', ''),
                ];
            });

        return Inertia::render('reports/trial-balance', [
            'entries' => $entries,
        ]);
    }
}
