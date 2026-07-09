<?php

namespace App\Http\Requests\Transaction;

use App\Enums\TransactionEntryType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
        return [
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:1000'],
            'details' => ['required', 'array', 'min:2'],
            'details.*.account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('is_active', true),
            ],
            'details.*.type' => ['required', Rule::enum(TransactionEntryType::class)],
            'details.*.amount' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
