<?php

namespace Database\Seeders;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assets
        $currentAssets = Account::create([
            'name' => 'Current Assets',
            'type' => AccountType::Asset,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $currentAssets->id,
            'name' => 'Cash & Bank',
            'type' => AccountType::Asset,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $currentAssets->id,
            'name' => 'Accounts Receivable',
            'type' => AccountType::Asset,
            'is_active' => true,
        ]);

        $fixedAssets = Account::create([
            'name' => 'Fixed Assets',
            'type' => AccountType::Asset,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $fixedAssets->id,
            'name' => 'Office Equipment',
            'type' => AccountType::Asset,
            'is_active' => true,
        ]);

        // Liabilities
        $currentLiabilities = Account::create([
            'name' => 'Current Liabilities',
            'type' => AccountType::Liability,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $currentLiabilities->id,
            'name' => 'Accounts Payable',
            'type' => AccountType::Liability,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $currentLiabilities->id,
            'name' => 'Tax Payable',
            'type' => AccountType::Liability,
            'is_active' => true,
        ]);

        $longTermLiabilities = Account::create([
            'name' => 'Long-Term Liabilities',
            'type' => AccountType::Liability,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $longTermLiabilities->id,
            'name' => 'Bank Loans',
            'type' => AccountType::Liability,
            'is_active' => true,
        ]);

        // Equity
        $shareholdersEquity = Account::create([
            'name' => 'Shareholders Equity',
            'type' => AccountType::Equity,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $shareholdersEquity->id,
            'name' => 'Common Stock',
            'type' => AccountType::Equity,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $shareholdersEquity->id,
            'name' => 'Retained Earnings',
            'type' => AccountType::Equity,
            'is_active' => true,
        ]);

        // Revenue
        $operatingRevenue = Account::create([
            'name' => 'Operating Revenue',
            'type' => AccountType::Revenue,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $operatingRevenue->id,
            'name' => 'Service Revenue',
            'type' => AccountType::Revenue,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $operatingRevenue->id,
            'name' => 'Product Sales',
            'type' => AccountType::Revenue,
            'is_active' => true,
        ]);

        // Expense
        $operatingExpenses = Account::create([
            'name' => 'Operating Expenses',
            'type' => AccountType::Expense,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $operatingExpenses->id,
            'name' => 'Salaries & Wages',
            'type' => AccountType::Expense,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $operatingExpenses->id,
            'name' => 'Office Supplies',
            'type' => AccountType::Expense,
            'is_active' => true,
        ]);
        Account::create([
            'parent_id' => $operatingExpenses->id,
            'name' => 'Rent Expense',
            'type' => AccountType::Expense,
            'is_active' => true,
        ]);
    }
}
