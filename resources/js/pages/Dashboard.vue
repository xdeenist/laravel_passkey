<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-semibold mb-2">Profile</h3>
      <p class="text-gray-600">Email: {{ user?.email }}</p>
      <ProfileEdit />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Passkeys</h3>
      <PasskeyRegister />
      <PasskeyList class="mt-4" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { usePasskeys } from '../composables/usePasskeys';
import PasskeyList from '../components/PasskeyList.vue';
import PasskeyRegister from '../components/PasskeyRegister.vue';
import ProfileEdit from '../components/ProfileEdit.vue';

const { user, fetchUser } = useAuth();
const { fetchPasskeys } = usePasskeys();

onMounted(async () => {
  await fetchUser();
  await fetchPasskeys();
});
</script>
