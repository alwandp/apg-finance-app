<?php

namespace App\Actions\Account;

use App\Enums\AccountType;
use App\Models\Account;

class GenerateAccountCode
{
    /**
     * Generate an account code based on account type and optional parent account.
     */
    public function execute(AccountType|string $type, ?Account $parent = null): string
    {
        if (is_string($type)) {
            $type = AccountType::tryFrom($type) ?? AccountType::Asset;
        }

        if ($parent !== null) {
            $childCodes = Account::where('parent_id', $parent->id)->pluck('code');

            if ($childCodes->isNotEmpty()) {
                $maxCode = $childCodes->map(fn ($c) => is_numeric($c) ? (int) $c : 0)->max();
                if ($maxCode > 0) {
                    return (string) ($maxCode + 1);
                }
            }

            if (is_numeric($parent->code)) {
                return (string) (((int) $parent->code) + 1);
            }

            return $parent->code.'-1';
        }

        $rootPrefix = match ($type) {
            AccountType::Asset => 1000,
            AccountType::Liability => 2000,
            AccountType::Equity => 3000,
            AccountType::Revenue => 4000,
            AccountType::Expense => 5000,
        };

        $rootCodes = Account::whereNull('parent_id')
            ->where('type', $type->value)
            ->pluck('code');

        if ($rootCodes->isNotEmpty()) {
            $maxCode = $rootCodes->map(fn ($c) => is_numeric($c) ? (int) $c : 0)->max();
            if ($maxCode > 0) {
                return (string) ($maxCode + 100);
            }
        }

        return (string) $rootPrefix;
    }
}
