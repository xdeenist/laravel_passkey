<template>
  <div>
    <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded mb-3">
      {{ error }}
    </div>
    <div v-if="success" class="bg-green-50 text-green-600 text-sm p-3 rounded mb-3">
      Name updated successfully!
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="saving || name === user?.name"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Verifying passkey...' : 'Save (confirm with Passkey)' }}
        </button>
        <button
          v-if="name !== user?.name"
          type="button"
          @click="name = user?.name || ''"
          class="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import api from '../api/axios';
import { base64urlToBuffer, bufferToBase64url } from '../composables/webauthn';

const { user, fetchUser } = useAuth();

const name = ref(user.value?.name || '');
const saving = ref(false);
const error = ref('');
const success = ref(false);

watch(() => user.value?.name, (val) => {
  if (val) name.value = val;
});

async function handleSubmit() {
  error.value = '';
  success.value = false;
  saving.value = true;

  try {
    // Step 1: Get assertion options for the current user
    const { data: options } = await api.post('/profile/verify-options');

    // Step 2: Trigger passkey verification in browser
    const credential = await navigator.credentials.get({
      publicKey: {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map(c => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      },
    });

    // Step 3: Send assertion + new name to server
    await api.put('/profile/name', {
      name: name.value,
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: bufferToBase64url(credential.response.authenticatorData),
        clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        signature: bufferToBase64url(credential.response.signature),
        userHandle: credential.response.userHandle
          ? bufferToBase64url(credential.response.userHandle)
          : null,
      },
    });

    await fetchUser();
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (e) {
    if (e.name === 'NotAllowedError') {
      error.value = 'Passkey verification was cancelled.';
    } else {
      error.value = e.response?.data?.message || 'Failed to update name.';
    }
  } finally {
    saving.value = false;
  }
}
</script>
