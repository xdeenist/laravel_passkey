<template>
  <div>
    <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded mb-3">
      {{ error }}
    </div>
    <div v-if="success" class="bg-green-50 text-green-600 text-sm p-3 rounded mb-3">
      Passkey registered successfully!
    </div>
    <div class="flex gap-2">
      <input
        v-model="alias"
        type="text"
        placeholder="Passkey name (e.g. MacBook)"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="handleRegister"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
      >
        {{ loading ? 'Registering...' : 'Add Passkey' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePasskeys } from '../composables/usePasskeys';

const { registerPasskey, loading } = usePasskeys();

const alias = ref('');
const error = ref('');
const success = ref(false);

async function handleRegister() {
  error.value = '';
  success.value = false;
  try {
    await registerPasskey(alias.value);
    alias.value = '';
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (e) {
    if (e.name === 'NotAllowedError') {
      error.value = 'Passkey registration was cancelled.';
    } else {
      error.value = e.response?.data?.message || 'Failed to register passkey.';
    }
  }
}
</script>
