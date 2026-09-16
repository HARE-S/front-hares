import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

if (import.meta.env.DEV) {
  import('./tests/mswSetup');
}

const app = createApp(App);
app.use(router);
app.mount('#app');