import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'
// import network from './network'

createApp(App)
  // .use(network)
  .use(store, key)
  .use(router)
  .mount('#app')
