import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAppRouter } from '@/router/index';
import { createMemoryHistory } from 'vue-router';
import { ref } from 'vue';

const mockUser = ref({ name: 'Yeremi', email: 'yeremi@grupopenascal.com', role: 'admin' });
const mockIsAuthenticated = ref(true);

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    isPending: ref(false),
    logout: vi.fn(),
    load: vi.fn().mockResolvedValue()
  })
}));

describe('Tarea 4.2: Enrutamiento desacoplado y rutas canónicas en AppShell', () => {
  let router;

  beforeEach(() => {
    mockUser.value = { name: 'Yeremi', email: 'yeremi@grupopenascal.com', role: 'admin' };
    mockIsAuthenticated.value = true;
    router = createAppRouter(createMemoryHistory());
  });

  it('resuelve correctamente la ruta canónica /dashboard', async () => {
    await router.push('/dashboard');
    expect(router.currentRoute.value.path).toBe('/dashboard');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('resuelve correctamente la ruta canónica /classroom para Registro en Aula', async () => {
    await router.push('/classroom');
    expect(router.currentRoute.value.path).toBe('/classroom');
    expect(router.currentRoute.value.name).toBe('classroom');
  });

  it('resuelve el alias /bulk-entry dirigiéndolo a la ruta de classroom', async () => {
    await router.push('/bulk-entry');
    expect(router.currentRoute.value.path).toBe('/bulk-entry');
    expect(router.currentRoute.value.name).toBe('classroom');
  });

  it('resuelve correctamente la ruta canónica /resources para Recursos Pedagógicos', async () => {
    await router.push('/resources');
    expect(router.currentRoute.value.path).toBe('/resources');
    expect(router.currentRoute.value.name).toBe('resources');
  });

  it('resuelve correctamente la ruta /sections/:sectionId con params reactivos', async () => {
    await router.push('/sections/sec-42');
    expect(router.currentRoute.value.path).toBe('/sections/sec-42');
    expect(router.currentRoute.value.params.sectionId).toBe('sec-42');
  });

  it('resuelve la ruta /import para docentes y administradores', async () => {
    await router.push('/import');
    expect(router.currentRoute.value.path).toBe('/import');
    expect(router.currentRoute.value.name).toBe('import');
  });

  it('resuelve el alias /admin/import', async () => {
    await router.push('/admin/import');
    expect(router.currentRoute.value.path).toBe('/admin/import');
    expect(router.currentRoute.value.name).toBe('import');
  });

  it('redirige automáticamente /dashboard?tab=bulk-entry hacia /classroom', async () => {
    await router.push('/dashboard?tab=bulk-entry');
    expect(router.currentRoute.value.path).toBe('/classroom');
  });

  it('redirige automáticamente /dashboard?tab=catalog hacia /resources con query tab=tests', async () => {
    await router.push('/dashboard?tab=catalog');
    expect(router.currentRoute.value.path).toBe('/resources');
    expect(router.currentRoute.value.query.tab).toBe('tests');
  });

  it('redirige automáticamente /dashboard?tab=import hacia /import', async () => {
    await router.push('/dashboard?tab=import');
    expect(router.currentRoute.value.path).toBe('/import');
  });
});
