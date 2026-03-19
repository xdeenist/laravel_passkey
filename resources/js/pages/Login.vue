<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full max-w-sm px-4">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>

      <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username webauthn"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="my-4 flex items-center">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="px-3 text-sm text-gray-500">or</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <button
        @click="handlePasskeyLogin"
        :disabled="loading"
        class="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3a6 6 0 0 1 0 12 6 6 0 0 1 0-12z"/>
          <path d="M15 21v-4l-3-3"/>
          <path d="M18 18l-3-3"/>
        </svg>
        Login with Passkey
      </button>

      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an account?
        <router-link to="/register" class="text-blue-600 hover:underline">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const { login, loginWithPasskey, loading } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');

async function handleLogin() {
  error.value = '';
  try {
    await login(email.value, password.value);
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed.';
  }
}

async function handlePasskeyLogin() {
  error.value = '';
  try {
    await loginWithPasskey();
  } catch (e) {
    if (e.name === 'NotAllowedError') {
      error.value = 'Passkey authentication was cancelled.';
    } else {
      error.value = e.response?.data?.message || 'Passkey login failed.';
    }
  }
}
</script>
