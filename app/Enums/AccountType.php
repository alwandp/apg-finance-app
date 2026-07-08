<?php

namespace App\Enums;

enum AccountType: string
{
    case Asset = 'Asset';
    case Liability = 'Liability';
    case Equity = 'Equity';
    case Revenue = 'Revenue';
    case Expense = 'Expense';
}
