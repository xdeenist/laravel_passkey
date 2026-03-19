import { ref } from 'vue';
import api from '../api/axios';
import { base64urlToBuffer, bufferToBase64url } from './webauthn';

const passkeys = ref([]);
const loading = ref(false);

export function usePasskeys() {
  async function fetchPasskeys() {
    const { data } = await api.get('/passkeys');
    passkeys.value = data;
  }

  async function registerPasskey(alias) {
    loading.value = true;
    try {
      // Step 1: Get attestation options
      const { data: options } = await api.post('/passkeys/register/options');

      // Step 2: Call WebAuthn browser API
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64urlToBuffer(options.challenge),
          user: {
            ...options.user,
            id: base64urlToBuffer(options.user.id),
          },
          excludeCredentials: (options.excludeCredentials || []).map(c => ({
            ...c,
            id: base64urlToBuffer(c.id),
          })),
        },
      });

      // Step 3: Send attestation to server
      await api.post('/passkeys/register', {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64url(credential.response.attestationObject),
          clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        },
        alias: alias || 'My Passkey',
      });

      await fetchPasskeys();
    } finally {
      loading.value = false;
    }
  }

  async function deletePasskey(id) {
    await api.delete(`/passkeys/${id}`);
    passkeys.value = passkeys.value.filter(p => p.id !== id);
  }

  return {
    passkeys,
    loading,
    fetchPasskeys,
    registerPasskey,
    deletePasskey,
  };
}
