import { ref, computed } from 'vue';
import api from '../api/axios';
import router from '../router';
import { base64urlToBuffer, bufferToBase64url } from './webauthn';

const user = ref(null);
const loading = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!localStorage.getItem('access_token'));

  async function fetchUser() {
    try {
      const { data } = await api.get('/user');
      user.value = data;
    } catch {
      user.value = null;
      localStorage.removeItem('access_token');
    }
  }

  async function register(name, email, password, passwordConfirmation) {
    loading.value = true;
    try {
      const { data } = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      localStorage.setItem('access_token', data.access_token);
      user.value = data.user;
      await router.push({ name: 'dashboard' });
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    loading.value = true;
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('access_token', data.access_token);
      user.value = data.user;
      await router.push({ name: 'dashboard' });
    } finally {
      loading.value = false;
    }
  }

  async function loginWithPasskey() {
    loading.value = true;
    try {
      // Step 1: Get assertion options
      const { data: options } = await api.post('/passkeys/login/options');

      // Step 2: Call WebAuthn browser API
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

      // Step 3: Send assertion to server
      const { data } = await api.post('/passkeys/login', {
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

      localStorage.setItem('access_token', data.access_token);
      user.value = data.user;
      await router.push({ name: 'dashboard' });
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post('/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    user.value = null;
    await router.push({ name: 'login' });
  }

  // Init: fetch user if token exists
  if (isAuthenticated.value && !user.value) {
    fetchUser();
  }

  return {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    loginWithPasskey,
    logout,
    fetchUser,
  };
}
