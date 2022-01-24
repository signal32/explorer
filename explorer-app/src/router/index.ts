import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import AuthPage from '@/views/AuthPage.vue';
import DebugPage from '@/views/DebugPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/auth',
    name: 'AuthPage',
    component: AuthPage
  },
  {
    path: '/debug',
    name: 'DebugPage',
    component: DebugPage
  },
  {
    path: '/view/',
    component: HomePage,
    children: [
      {
        path: '',
        redirect: 'map',
      },
      {
        path: 'map',
        component: () => import('@/views/tabs/MapTab.vue'),
      },
      {
        path: 'discover',
        component: () => import('@/views/tabs/BlankTab.vue'),
      },
      {
        path: 'profile',
        component: () => import('@/views/tabs/ProfileTab.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
