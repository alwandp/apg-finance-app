<?php

namespace App\Enums;

enum TransactionEntryType: string
{
    case Debit = 'debit';
    case Credit = 'credit';
}
