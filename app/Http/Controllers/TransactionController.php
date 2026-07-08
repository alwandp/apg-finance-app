<?php

namespace App\Http\Controllers;

use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with(['details.account']);

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', (string) $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', (string) $request->input('end_date'));
        }

        if ($request->filled('account_id')) {
            $accountId = (int) $request->input('account_id');
            $query->whereHas('details', function (Builder $q) use ($accountId): void {
                $q->where('account_id', $accountId);
            });
        }

        $transactions = $query->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        $accounts = Account::orderBy('code')->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'filters' => $request->only(['start_date', 'end_date', 'account_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $accounts = Account::active()->orderBy('code')->get();

        return Inertia::render('transactions/create', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $transaction = Transaction::create($request->safe()->only(['date', 'description']));

            /** @var array<int, array<string, mixed>> $details */
            $details = $request->input('details');
            $transaction->details()->createMany($details);
        });

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction): Response
    {
        $transaction->load(['details.account']);

        return Inertia::render('transactions/show', [
            'transaction' => $transaction,
        ]);
    }
}
