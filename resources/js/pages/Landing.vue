<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center max-w-md px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Passkey Auth</h1>
      <p class="text-gray-600 mb-8">
        Laravel + Passport + WebAuthn Passkeys
      </p>
      <div class="flex gap-4 justify-center">
        <router-link
          to="/login"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </router-link>
        <router-link
          to="/register"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Register
        </router-link>
      </div>
    </div>
  </div>
</template>
