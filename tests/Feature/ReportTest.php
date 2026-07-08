<?php

use App\Enums\TransactionEntryType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->withoutVite();
});

test('trial balance report sums debits and credits correctly', function () {
    $account = Account::factory()->create(['is_active' => true, 'code' => '1010']);
    $tx = Transaction::factory()->create();

    TransactionDetail::factory()->create([
        'transaction_id' => $tx->id,
        'account_id' => $account->id,
        'type' => TransactionEntryType::Debit,
        'amount' => 500.00,
    ]);

    TransactionDetail::factory()->create([
        'transaction_id' => $tx->id,
        'account_id' => $account->id,
        'type' => TransactionEntryType::Credit,
        'amount' => 150.00,
    ]);

    $response = $this->actingAs($this->user)->get(route('reports.trial-balance'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('reports/trial-balance')
        ->has('entries')
        ->where('entries.0.account_id', $account->id)
        ->where('entries.0.total_debit', '500.00')
        ->where('entries.0.total_credit', '150.00')
        ->where('entries.0.balance', '350.00')
    );
});

test('trial balance report only includes active accounts', function () {
    $active = Account::factory()->create(['is_active' => true, 'code' => '2000']);
    $inactive = Account::factory()->create(['is_active' => false, 'code' => '2001']);

    $response = $this->actingAs($this->user)->get(route('reports.trial-balance'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('reports/trial-balance')
        ->has('entries', 1)
        ->where('entries.0.account_id', $active->id)
    );
});

test('dashboard returns expected summary and recent transactions data', function () {
    Account::factory()->count(3)->create();
    $tx = Transaction::factory()->create();

    $response = $this->actingAs($this->user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('summary.total_accounts', 3)
        ->where('summary.total_transactions', 1)
        ->has('recent_transactions', 1)
    );
});
