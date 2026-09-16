import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

/**
 * Rutas de toda la aplicación (Contrato 2).
 *
 * Reglas del equipo:
 *  - Nadie más edita este fichero sin avisar en la daily (REPARTO.md §6).
 *  - Todas las vistas van en `views/<seccion>/` y se cargan de forma
 *    perezosa (`() => import(...)`).
 *  - `meta.public` marca rutas accesibles sin sesión (login y 404).
 */
export const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/pending',
    name: 'pending',
    component: () => import('@/views/pending/PendingView.vue')
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue')
  },
  {
    path: '/centers',
    name: 'centers',
    component: () => import('@/views/centers/CentersView.vue')
  },
  {
    path: '/centers/:centerId/sections/:sectionId',
    name: 'section-detail',
    component: () => import('@/views/section-detail/SectionDetailView.vue')
  },
  {
    path: '/centers/:centerId/sections/:sectionId/students/:studentId',
    name: 'student-detail',
    component: () => import('@/views/student-detail/StudentDetailView.vue')
  },
  {
    path: '/bulk-entry',
    name: 'bulk-entry',
    component: () => import('@/views/bulk-entry/BulkEntryView.vue')
  },
  {
    path: '/tests',
    name: 'tests',
    component: () => import('@/views/tests-catalog/TestsCatalogView.vue')
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('@/views/books-catalog/BooksCatalogView.vue')
  },
  {
    path: '/import',
    name: 'import',
    component: () => import('@/views/import/ImportView.vue')
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/reports/ReportsView.vue')
  },
  {
    path: '/users-admin',
    name: 'users-admin',
    component: () => import('@/views/users-admin/UsersAdminView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true }
  }
];

/**
 * Guarda global: sin sesión, las rutas protegidas llevan al login y
 * recuerdan el destino para volver tras entrar.
 * Las rutas `public` (login, 404) siempre pasan.
 */
async function guard(to) {
  if (to.meta.public) return true;

  const auth = useAuth();

  // Cargar sesión si aún no se ha intentado
  await auth.load();

  if (!auth.isAuthenticated.value) {
    return { name: 'login', query: { next: to.fullPath } };
  }

  // Si el usuario está pendiente y no intenta acceder a pending, redirigir
  if (auth.isPending.value && to.name !== 'pending') {
    return { name: 'pending' };
  }

  return true;
}

/**
 * Fábrica del router. La aplicación usa web history; los tests pasan
 * una memoria para no depender del navegador.
 */
export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes });
  router.beforeEach(guard);
  return router;
}

export default createAppRouter();