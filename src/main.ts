import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'
// import network from './network'
import Vue3Lottie from 'vue3-lottie'
import 'vue3-lottie/dist/style.css'

createApp(App)
  // .use(network)
  .use(store, key)
  .use(router)
  .use(Vue3Lottie, { name: 'Vue3Lottie' })
  .mount('#app')
