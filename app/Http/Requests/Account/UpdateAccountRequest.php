<?php

namespace App\Http\Requests\Account;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $account = $this->route('account');
        $accountId = $account instanceof Account ? $account->id : $account;

        $hasTransactions = false;
        if ($account instanceof Account) {
            $hasTransactions = $account->transactionDetails()->exists();
        }

        $typeRules = ['required', Rule::enum(AccountType::class)];
        if ($hasTransactions && $account instanceof Account) {
            $typeRules[] = Rule::in([$account->type->value]);
        }

        return [
            'parent_id' => ['nullable', 'exists:accounts,id', Rule::notIn([$accountId])],
            'name' => ['required', 'string', 'max:255'],
            'type' => $typeRules,
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Cannot change account type after transactions have been posted to this account.',
            'parent_id.not_in' => 'An account cannot be its own parent.',
        ];
    }
}
