<?php

namespace App\Http\Requests\Transaction;

use App\Enums\TransactionEntryType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                /** @var array<int, array<string, mixed>> $detailsInput */
                $detailsInput = $this->input('details', []);
                $details = collect($detailsInput);

                $totalDebit = number_format((float) $details->where('type', 'debit')->sum('amount'), 2, '.', '');
                $totalCredit = number_format((float) $details->where('type', 'credit')->sum('amount'), 2, '.', '');

                if (bccomp($totalDebit, $totalCredit, 2) !== 0) {
                    $validator->errors()->add('details', 'Total debits must equal total credits.');
                }
            },
        ];
    }
}
