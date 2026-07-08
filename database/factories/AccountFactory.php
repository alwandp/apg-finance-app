<?php

namespace Database\Factories;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'name' => fake()->words(3, true),
            'type' => fake()->randomElement(AccountType::cases()),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the account is an Asset.
     */
    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Asset,
        ]);
    }

    /**
     * Indicate that the account is a Liability.
     */
    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Liability,
        ]);
    }

    /**
     * Indicate that the account is Equity.
     */
    public function equity(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Equity,
        ]);
    }

    /**
     * Indicate that the account is Revenue.
     */
    public function revenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Revenue,
        ]);
    }

    /**
     * Indicate that the account is an Expense.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Expense,
        ]);
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the account has a parent.
     */
    public function withParent(?Account $parent = null): static
    {
        return $this->state(function (array $attributes) use ($parent) {
            $parentAccount = $parent ?? Account::factory()->create([
                'type' => $attributes['type'] ?? AccountType::Asset,
            ]);

            return [
                'parent_id' => $parentAccount->id,
                'type' => $parentAccount->type,
            ];
        });
    }
}
