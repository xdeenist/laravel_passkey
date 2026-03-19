<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm" v-if="isAuthenticated">
      <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/dashboard" class="text-lg font-semibold text-gray-800">Passkey App</router-link>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.name }}</span>
          <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-800">Logout</button>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth';

const { user, isAuthenticated, logout } = useAuth();

async function handleLogout() {
  await logout();
}
</script>
