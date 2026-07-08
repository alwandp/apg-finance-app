<?php

namespace App\Models;

use App\Enums\TransactionEntryType;
use Database\Factories\TransactionDetailFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $transaction_id
 * @property int $account_id
 * @property TransactionEntryType $type
 * @property string $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Transaction $transaction
 * @property-read Account $account
 */
class TransactionDetail extends Model
{
    /** @use HasFactory<TransactionDetailFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'transaction_id',
        'account_id',
        'type',
        'amount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => TransactionEntryType::class,
            'amount' => 'decimal:2',
        ];
    }

    /**
     * Get the parent transaction of this detail item.
     *
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the account associated with this transaction detail item.
     *
     * @return BelongsTo<Account, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
