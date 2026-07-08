<?php

namespace Database\Factories;

use App\Enums\TransactionEntryType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionDetail>
 */
class TransactionDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_id' => Transaction::factory(),
            'account_id' => Account::factory(),
            'type' => fake()->randomElement(TransactionEntryType::cases()),
            'amount' => fake()->randomFloat(2, 10, 1000),
        ];
    }

    /**
     * Indicate that the entry is a debit.
     */
    public function debit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TransactionEntryType::Debit,
        ]);
    }

    /**
     * Indicate that the entry is a credit.
     */
    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TransactionEntryType::Credit,
        ]);
    }
}
