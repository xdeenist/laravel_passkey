<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laragear\WebAuthn\Http\Requests\AssertedRequest;
use Laragear\WebAuthn\Http\Requests\AssertionRequest;

class ProfileController extends Controller
{
    public function assertionOptions(AssertionRequest $request): JsonResponse
    {
        // Generate assertion challenge for the current authenticated user
        return response()->json(
            $request->toVerify($request->user())
        );
    }

    public function updateName(AssertedRequest $request): JsonResponse
    {
        // Verify passkey assertion via 'web' guard (eloquent-webauthn provider)
        $verified = $request->login(guard: 'web');

        if (!$verified) {
            return response()->json(['message' => 'Passkey verification failed.'], 403);
        }

        // Clear session login (we use token auth)
        Auth::guard('web')->logout();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        // Update the token-authenticated user's name
        $user = $request->user('api');
        $user->name = $request->input('name');
        $user->save();

        return response()->json([
            'message' => 'Name updated.',
            'user' => $user,
        ]);
    }
}
