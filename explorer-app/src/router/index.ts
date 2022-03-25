import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import AuthPage from '@/views/AuthPage.vue';
import DebugPage from '@/views/DebugPage.vue';
import SettingsMenuList from '@/views/menus/SettingsMenuList.vue';
import PluginMenu from '@/views/menus/PluginMenu.vue';

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
    path: '/settings',
    name: 'SettingsPage',
    component: SettingsMenuList
  },
  {
      path: '/settings/plugins',
      component: () => import('@/views/menus/PluginMenu.vue'),
  },
  {
    path: '/settings/preferences',
    component: () => import('@/views/menus/PreferenceMenu.vue'),
  },
  {
    path: '/settings/interests',
    component: () => import('@/views/menus/InterestMenu.vue'),
  },
  {
    path: '/entity',
    name: 'Entity',
    component: () => import('@/views/EntityPage.vue')
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
