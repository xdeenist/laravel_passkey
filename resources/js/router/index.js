import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../pages/Landing.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';

const routes = [
  { path: '/', name: 'landing', component: Landing },
  { path: '/login', name: 'login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'register', component: Register, meta: { guest: true } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { auth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('access_token');

  if (to.meta.auth && !token) {
    return { name: 'login' };
  }

  if (to.meta.guest && token) {
    return { name: 'dashboard' };
  }
});

export default router;
