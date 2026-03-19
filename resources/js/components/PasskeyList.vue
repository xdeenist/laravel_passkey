<template>
  <div>
    <div v-if="passkeys.length === 0" class="text-sm text-gray-500">
      No passkeys registered yet.
    </div>
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b">
          <th class="text-left py-2 font-medium text-gray-600">Name</th>
          <th class="text-left py-2 font-medium text-gray-600">Created</th>
          <th class="text-right py-2 font-medium text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="passkey in passkeys" :key="passkey.id" class="border-b last:border-0">
          <td class="py-2">{{ passkey.alias || 'Unnamed' }}</td>
          <td class="py-2 text-gray-500">{{ formatDate(passkey.created_at) }}</td>
          <td class="py-2 text-right">
            <button
              @click="handleDelete(passkey.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { usePasskeys } from '../composables/usePasskeys';

const { passkeys, deletePasskey } = usePasskeys();

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

async function handleDelete(id) {
  if (confirm('Delete this passkey?')) {
    await deletePasskey(id);
  }
}
</script>
