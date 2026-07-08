<?php

use App\Enums\TransactionEntryType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Database\QueryException;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->withoutVite();
});

test('transactions index and create pages can be rendered', function () {
    $this->actingAs($this->user)->get(route('transactions.index'))->assertOk();
    $this->actingAs($this->user)->get(route('transactions.create'))->assertOk();
});

test('balanced transaction entry can be created', function () {
    $debitAccount = Account::factory()->create(['is_active' => true]);
    $creditAccount = Account::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->user)->post(route('transactions.store'), [
        'date' => '2026-07-08',
        'description' => 'Office equipment purchase',
        'details' => [
            [
                'account_id' => $debitAccount->id,
                'type' => TransactionEntryType::Debit->value,
                'amount' => 500.00,
            ],
            [
                'account_id' => $creditAccount->id,
                'type' => TransactionEntryType::Credit->value,
                'amount' => 500.00,
            ],
        ],
    ]);

    $response->assertRedirect(route('transactions.index'));

    $this->assertDatabaseHas('transactions', [
        'date' => '2026-07-08 00:00:00',
        'description' => 'Office equipment purchase',
    ]);

    $this->assertDatabaseHas('transaction_details', [
        'account_id' => $debitAccount->id,
        'type' => 'debit',
        'amount' => 500.00,
    ]);

    $this->assertDatabaseHas('transaction_details', [
        'account_id' => $creditAccount->id,
        'type' => 'credit',
        'amount' => 500.00,
    ]);
});

test('unbalanced transaction entry fails validation with equilibrium error', function () {
    $debitAccount = Account::factory()->create(['is_active' => true]);
    $creditAccount = Account::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->user)->post(route('transactions.store'), [
        'date' => '2026-07-08',
        'description' => 'Unbalanced entry',
        'details' => [
            [
                'account_id' => $debitAccount->id,
                'type' => TransactionEntryType::Debit->value,
                'amount' => 600.00,
            ],
            [
                'account_id' => $creditAccount->id,
                'type' => TransactionEntryType::Credit->value,
                'amount' => 500.00,
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['details' => 'Total debits must equal total credits.']);
    $this->assertDatabaseCount('transactions', 0);
});

test('transaction referencing inactive account fails validation', function () {
    $activeAccount = Account::factory()->create(['is_active' => true]);
    $inactiveAccount = Account::factory()->create(['is_active' => false]);

    $response = $this->actingAs($this->user)->post(route('transactions.store'), [
        'date' => '2026-07-08',
        'description' => 'Invalid entry with inactive account',
        'details' => [
            [
                'account_id' => $activeAccount->id,
                'type' => TransactionEntryType::Debit->value,
                'amount' => 100.00,
            ],
            [
                'account_id' => $inactiveAccount->id,
                'type' => TransactionEntryType::Credit->value,
                'amount' => 100.00,
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['details.1.account_id']);
    $this->assertDatabaseCount('transactions', 0);
});

test('transaction must have at least two detail lines', function () {
    $account = Account::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->user)->post(route('transactions.store'), [
        'date' => '2026-07-08',
        'description' => 'Single line entry',
        'details' => [
            [
                'account_id' => $account->id,
                'type' => TransactionEntryType::Debit->value,
                'amount' => 100.00,
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['details']);
    $this->assertDatabaseCount('transactions', 0);
});

test('deleting a transaction cascades to transaction details', function () {
    $transaction = Transaction::factory()->create();
    $account = Account::factory()->create();

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => TransactionEntryType::Debit,
        'amount' => 250.00,
    ]);

    $this->assertDatabaseCount('transaction_details', 1);

    $transaction->delete();

    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('transaction_details', 0);
});

test('cannot delete an account that has transaction details referencing it', function () {
    $transaction = Transaction::factory()->create();
    $account = Account::factory()->create();

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => TransactionEntryType::Debit,
        'amount' => 100.00,
    ]);

    expect(fn () => $account->delete())->toThrow(QueryException::class);
});

test('transactions index endpoint filters by date range correctly', function () {
    $oldTx = Transaction::factory()->create(['date' => '2026-06-01']);
    $newTx = Transaction::factory()->create(['date' => '2026-07-05']);

    $response = $this->actingAs($this->user)->get(route('transactions.index', [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('transactions/index')
        ->has('transactions', 1)
        ->where('transactions.0.id', $newTx->id)
    );
});

test('transactions index endpoint filters by account correctly', function () {
    $tx1 = Transaction::factory()->create();
    $tx2 = Transaction::factory()->create();

    $accountA = Account::factory()->create();
    $accountB = Account::factory()->create();

    TransactionDetail::factory()->create([
        'transaction_id' => $tx1->id,
        'account_id' => $accountA->id,
    ]);

    TransactionDetail::factory()->create([
        'transaction_id' => $tx2->id,
        'account_id' => $accountB->id,
    ]);

    $response = $this->actingAs($this->user)->get(route('transactions.index', [
        'account_id' => $accountA->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('transactions/index')
        ->has('transactions', 1)
        ->where('transactions.0.id', $tx1->id)
    );
});

test('transaction show page renders with loaded details and accounts', function () {
    $transaction = Transaction::factory()->create();
    $account = Account::factory()->create(['name' => 'Cash']);

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => TransactionEntryType::Debit,
        'amount' => 350.00,
    ]);

    $response = $this->actingAs($this->user)->get(route('transactions.show', $transaction));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('transactions/show')
        ->where('transaction.id', $transaction->id)
        ->has('transaction.details', 1)
    );
});
