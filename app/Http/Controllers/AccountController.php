<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Models\Account;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $accounts = Account::with(['children.children.children'])
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();

        $allAccounts = Account::orderBy('code')->get();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
            'allAccounts' => $allAccounts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $parents = Account::active()->orderBy('code')->get();
        $types = array_map(fn (AccountType $case) => $case->value, AccountType::cases());

        return Inertia::render('accounts/create', [
            'parents' => $parents,
            'types' => $types,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountRequest $request): RedirectResponse
    {
        Account::create($request->validated());

        return redirect()->route('accounts.index')->with('success', 'Account created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $account): Response
    {
        $account->load([
            'children',
            'parent',
            'transactionDetails' => fn ($q) => $q->with('transaction')->latest('id'),
        ]);

        return Inertia::render('accounts/show', [
            'account' => $account,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account): Response
    {
        $parents = Account::where('id', '!=', $account->id)->orderBy('code')->get();
        $types = array_map(fn (AccountType $case) => $case->value, AccountType::cases());

        return Inertia::render('accounts/edit', [
            'account' => $account,
            'parents' => $parents,
            'types' => $types,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        $account->update($request->validated());

        return redirect()->route('accounts.index')->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account): RedirectResponse
    {
        try {
            $account->delete();

            return redirect()->route('accounts.index')->with('success', 'Account deleted successfully.');
        } catch (QueryException $e) {
            return back()->withErrors([
                'error' => 'Cannot delete this account because it has child accounts or associated transactions.',
            ]);
        }
    }
}
