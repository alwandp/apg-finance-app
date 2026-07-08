<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the financial overview dashboard.
     */
    public function index(): Response
    {
        $totalAccounts = Account::count();
        $totalTransactions = Transaction::count();

        $totalDebit = (float) TransactionDetail::where('type', 'debit')->sum('amount');
        $totalCredit = (float) TransactionDetail::where('type', 'credit')->sum('amount');

        $formattedDebit = number_format($totalDebit, 2, '.', '');
        $formattedCredit = number_format($totalCredit, 2, '.', '');
        $isBalanced = bccomp($formattedDebit, $formattedCredit, 2) === 0;

        $recentTransactions = Transaction::with(['details.account'])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'summary' => [
                'total_accounts' => $totalAccounts,
                'total_transactions' => $totalTransactions,
                'total_debit' => $formattedDebit,
                'total_credit' => $formattedCredit,
                'is_balanced' => $isBalanced,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
