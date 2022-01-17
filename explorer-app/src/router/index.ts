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
    path: '/tabs/',
    component: HomePage,
    children: [
      {
        path: '',
        redirect: 'tab1',
      },
      {
        path: 'tab1',
        component: () => import('@/views/AuthPage.vue'),
      },
      {
        path: 'tab2',
        component: () => import('@/views/DebugPage.vue'),
      },
      {
        path: 'tab3',
        component: () => import('@/views/AuthPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
