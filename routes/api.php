<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasskeyController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Passkey login (public, needs session for challenge)
Route::middleware('webauthn')->group(function () {
    Route::post('/passkeys/login/options', [PasskeyController::class, 'loginOptions']);
    Route::post('/passkeys/login', [PasskeyController::class, 'login']);
});

// Authenticated routes
Route::middleware('auth:api')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [LoginController::class, 'logout']);

    // Passkey management (needs session for attestation challenge)
    Route::middleware('webauthn')->group(function () {
        Route::get('/passkeys', [PasskeyController::class, 'index']);
        Route::post('/passkeys/register/options', [PasskeyController::class, 'registerOptions']);
        Route::post('/passkeys/register', [PasskeyController::class, 'register']);
        Route::delete('/passkeys/{id}', [PasskeyController::class, 'destroy']);

        // Profile update with passkey confirmation
        Route::post('/profile/verify-options', [ProfileController::class, 'assertionOptions']);
        Route::put('/profile/name', [ProfileController::class, 'updateName']);
    });
});
