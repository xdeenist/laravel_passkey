<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laragear\WebAuthn\Http\Requests\AssertedRequest;
use Laragear\WebAuthn\Http\Requests\AssertionRequest;
use Laragear\WebAuthn\Http\Requests\AttestedRequest;
use Laragear\WebAuthn\Http\Requests\AttestationRequest;

class PasskeyController extends Controller
{
    // --- Passkey Registration (Attestation) ---

    public function registerOptions(AttestationRequest $request): JsonResponse
    {
        return response()->json(
            $request->toCreate()
        );
    }

    public function register(AttestedRequest $request): JsonResponse
    {
        $request->save([
            'alias' => $request->input('alias', 'My Passkey'),
        ]);

        return response()->json(['message' => 'Passkey registered.'], 201);
    }

    // --- Passkey Login (Assertion) ---

    public function loginOptions(AssertionRequest $request): JsonResponse
    {
        return response()->json(
            $request->toVerify()
        );
    }

    public function login(AssertedRequest $request): JsonResponse
    {
        // Use 'web' guard which has 'eloquent-webauthn' provider
        $user = $request->login(guard: 'web');

        if (!$user) {
            return response()->json(['message' => 'Authentication failed.'], 401);
        }

        // Logout from session (we use token-based auth via Passport)
        Auth::guard('web')->logout();

        $token = $user->createToken('passkey_auth');

        return response()->json([
            'access_token' => $token->accessToken,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    // --- Passkey Management ---

    public function index(Request $request): JsonResponse
    {
        $passkeys = $request->user()
            ->webAuthnCredentials()
            ->select(['id', 'alias', 'created_at'])
            ->get();

        return response()->json($passkeys);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $deleted = $request->user()
            ->webAuthnCredentials()
            ->where('id', $id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Passkey not found.'], 404);
        }

        return response()->json(['message' => 'Passkey deleted.']);
    }
}
