import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LocalGameView from '../views/LocalGameView.vue'
import OnlineGameView from '../views/OnlineGameView.vue'
import StartLocalGameView from '../views/StartLocalGameView.vue'
import StartOnlineGameView from '../views/StartOnlineGameView.vue'
import SettingsView from '../views/SettingsView.vue'
import ReplayView from '../views/ReplayView.vue'
import SavedGameView from '../views/SavedGameView.vue'

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
    component: StartOnlineGameView
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  {
    path: '/replay',
    name: 'savedGame',
    component: SavedGameView
  },
  {
    path: '/replay/game/:id',
    name: 'replay',
    component: ReplayView
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
