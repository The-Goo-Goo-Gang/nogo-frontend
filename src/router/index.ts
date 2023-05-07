import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LocalGameView from '../views/LocalGameView.vue'
import OnlineGameView from '../views/OnlineGameView.vue'
import StartLocalGameView from '../views/StartLocalGameView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/game',
    name: 'gameLocal',
    component: LocalGameView
  },
  {
    path: '/game/online',
    name: 'gameOnline',
    component: OnlineGameView
  },
  {
    path: '/start/local',
    name: 'startLocalGame',
    component: StartLocalGameView
  },
  {
    path: '/start/online',
    name: 'startOnlineGame',
    component: () => import(/* webpackChunkName: "startOnlineGame" */ '../views/StartOnlineGameView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
