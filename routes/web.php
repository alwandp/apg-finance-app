<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('accounts', AccountController::class);
});

require __DIR__.'/settings.php';
