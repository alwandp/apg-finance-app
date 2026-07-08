<?php

namespace App\Models;

use App\Actions\Account\GenerateAccountCode;
use App\Enums\AccountType;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $code
 * @property string $name
 * @property AccountType $type
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Account|null $parent
 * @property-read Collection<int, Account> $children
 * @property-read Collection<int, TransactionDetail> $transactionDetails
 */
class Account extends Model
{
    /** @use HasFactory<AccountFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'type',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AccountType::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Account $account): void {
            if (empty($account->code)) {
                /** @var GenerateAccountCode $generator */
                $generator = app(GenerateAccountCode::class);

                $parent = null;
                if ($account->parent_id !== null) {
                    $parent = Account::find($account->parent_id);
                }

                $account->code = $generator->execute($account->type, $parent);
            }
        });
    }

    /**
     * Get the parent account.
     *
     * @return BelongsTo<Account, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    /**
     * Get the child accounts.
     *
     * @return HasMany<Account, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    /**
     * Scope a query to only include active accounts.
     *
     * @param  Builder<Account>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Get the transaction details associated with the account.
     *
     * @return HasMany<TransactionDetail, $this>
     */
    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
