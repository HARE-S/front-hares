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
    path: '/',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/pending',
    name: 'pending',
    component: () => import('@/views/pending/PendingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/layout/DashboardLayout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/approval',
    name: 'user-approval',
    component: () => import('@/views/admin/UserApprovalView.vue'),
    meta: { requiresAuth: true, requiresRole: 'superadmin' }
  },
  /**
   * FE-25 (Marlen, 19/09/2026): rutas de "Alumnado" (centros → secciones →
   * alumnado → ficha).
   *
   * POR QUÉ SE AÑADIERON: la navegación de FE-25 necesita estas rutas para
   * funcionar y el índice de rutas no las tenía, aunque se había comunicado
   * Se añaden aquí el mínimo necesario para
   * FE-25 (no las rutas de otras historias).
   */
  {
    path: '/centers',
    component: () => import('@/layout/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'centers',
        component: () => import('@/views/centers/CentersListView.vue')
      },
      {
        path: ':centerId',
        name: 'center-detail',
        component: () => import('@/views/centers/CenterDetailView.vue'),
        props: true
      },
      {
        path: ':centerId/sections/:sectionId/students',
        name: 'section-students',
        component: () => import('@/views/centers/SectionStudentsView.vue'),
        props: true
      },
      {
        path: ':centerId/sections/:sectionId/students/:studentId',
        name: 'student-detail',
        component: () => import('@/views/student-detail/StudentDetailView.vue'),
        props: true
      },
      /**
       * FE-32 (Marlen, 21/09/2026): ruta de "Comparativa por grupos".
       *
       * POR QUÉ SE AÑADIÓ: FE-32 necesita una página accesible para la
       * comparativa de evolución entre grupos (BE-32) y la única pantalla
       * Alumnado de la que Marlen es responsable es esta subruta. Sigue el
       * precedente de FE-25: se añade el mínimo necesario aquí.
       */
      {
        path: 'comparison',
        name: 'comparison',
        component: () => import('@/views/comparison/ComparisonView.vue')
      }
    ]
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
  const auth = useAuth();

  console.log(`🔐 Guard: ${to.path} (meta: ${JSON.stringify(to.meta)})`);

  // Rutas públicas: login (/) y 404
  if (to.meta.public) {
    // Si usuario está autenticado e intenta ir a login (/), redirigir al dashboard/admin
    if (to.name === 'login' && auth.isAuthenticated.value) {
      console.log(`✅ Autenticado intenta login`);
      if (auth.user.value?.role === 'superadmin') {
        return { name: 'user-approval' };
      }
      return { name: 'dashboard' };
    }
    console.log(`✅ Ruta pública permitida`);
    return true;
  }

  // Rutas protegidas: verificar autenticación
  console.log(`🔑 Verificando autenticación para ruta protegida...`);
  await auth.load();

  if (!auth.isAuthenticated.value) {
    console.log(`❌ No autenticado, redirigiendo a login (/)`);
    return { name: 'login', query: { next: to.fullPath } };
  }

  // Usuario autenticado está pendiente
  if (auth.isPending.value && to.name !== 'pending') {
    console.log(`⏳ Usuario pendiente de aprobación`);
    return { name: 'pending' };
  }

  console.log(`✅ Ruta protegida permitida`);
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