import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

async function startApp() {
  // Solo activar MSW en desarrollo si se solicita explícitamente vía VITE_USE_MOCKS=true
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { mswReady } = await import('./tests/mswSetup');
    await mswReady;
  }

  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

startApp();