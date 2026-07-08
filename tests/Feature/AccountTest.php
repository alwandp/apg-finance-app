<?php

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->withoutVite();
});

test('accounts index page can be rendered', function () {
    $response = $this->actingAs($this->user)->get(route('accounts.index'));
    $response->assertOk();
});

test('accounts create page can be rendered', function () {
    $response = $this->actingAs($this->user)->get(route('accounts.create'));
    $response->assertOk();
});

test('user can create a new root account and code is auto-generated based on type', function () {
    $response = $this->actingAs($this->user)->post(route('accounts.store'), [
        'name' => 'Petty Cash',
        'type' => AccountType::Asset->value,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'name' => 'Petty Cash',
        'type' => 'Asset',
        'code' => '1000',
    ]);
});

test('user can create child account with auto-incremented child code', function () {
    $parent = Account::factory()->asset()->create();

    $response = $this->actingAs($this->user)->post(route('accounts.store'), [
        'parent_id' => $parent->id,
        'name' => 'Operating Cash',
        'type' => AccountType::Asset->value,
        'is_active' => true,
    ]);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'name' => 'Operating Cash',
        'parent_id' => $parent->id,
        'code' => '1001',
    ]);
});

test('user can view an account show page', function () {
    $account = Account::factory()->create();

    $response = $this->actingAs($this->user)->get(route('accounts.show', $account));
    $response->assertOk();
});

test('user can update an account', function () {
    $account = Account::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($this->user)->put(route('accounts.update', $account), [
        'name' => 'New Name',
        'type' => $account->type->value,
        'is_active' => false,
    ]);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'id' => $account->id,
        'name' => 'New Name',
        'is_active' => 0,
    ]);
});

test('cannot delete parent account that has child accounts', function () {
    $parent = Account::factory()->create();
    $child = Account::factory()->create(['parent_id' => $parent->id]);

    $response = $this->actingAs($this->user)->delete(route('accounts.destroy', $parent));

    $response->assertSessionHasErrors(['error']);
    $this->assertDatabaseHas('accounts', ['id' => $parent->id]);
});

test('can delete account with no children or transactions', function () {
    $account = Account::factory()->create();

    $response = $this->actingAs($this->user)->delete(route('accounts.destroy', $account));

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
});

test('active scope filters out inactive accounts', function () {
    Account::factory()->create(['is_active' => true, 'name' => 'Active Account']);
    Account::factory()->create(['is_active' => false, 'name' => 'Inactive Account']);

    expect(Account::active()->count())->toBe(1)
        ->and(Account::active()->first()->name)->toBe('Active Account');
});

test('store account validates required fields and valid type', function () {
    $response = $this->actingAs($this->user)->post(route('accounts.store'), [
        'name' => '',
        'type' => 'InvalidType',
    ]);

    $response->assertSessionHasErrors(['name', 'type']);
});
