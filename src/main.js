import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

async function startApp() {
  // Esperar a que MSW esté listo en desarrollo
  if (import.meta.env.DEV) {
    const { mswReady } = await import('./tests/mswSetup');
    await mswReady;
  }

  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

startApp();