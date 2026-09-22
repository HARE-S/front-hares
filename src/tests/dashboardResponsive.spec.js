import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import KpiOverview from '@/components/dashboard/KpiOverview.vue';
import FluencyChart from '@/components/dashboard/FluencyChart.vue';
import LevelsDistribution from '@/components/dashboard/LevelsDistribution.vue';
import RecentAssessmentsTable from '@/components/dashboard/RecentAssessmentsTable.vue';
import DashboardLayout from '@/layout/DashboardLayout.vue';

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/dashboard' }),
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div><slot /></div>' }
}));

// Mock useAuth
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { name: 'M. Carmen', email: 'teacher@grupopenascal.com', role: 'teacher' } },
    isAuthenticated: { value: true },
    isPending: { value: false },
    logout: vi.fn(),
    load: vi.fn()
  })
}));

describe('Dashboard Responsive Design Suite', () => {
  describe('KpiOverview Responsive Grid (Móvil, Tableta, Escritorio)', () => {
    it('applies responsive column classes: 1-col on mobile, 2-col on tablet, 4-col on desktop', () => {
      const wrapper = mount(KpiOverview);
      const section = wrapper.find('section[aria-label="Métricas Principales"]');
      expect(section.exists()).toBe(true);

      const classes = section.classes();
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-1');
      expect(classes).toContain('sm:grid-cols-2');
      expect(classes).toContain('xl:grid-cols-4');
      expect(classes).toContain('gap-5');
    });

    it('renders cards with responsive padding, rounded corners and surface tokens', () => {
      const wrapper = mount(KpiOverview);
      const cards = wrapper.findAll('.kpi-card');
      expect(cards.length).toBe(4);
      cards.forEach(card => {
        expect(card.classes()).toContain('bg-surface-container-lowest');
        expect(card.classes()).toContain('rounded-xl');
        expect(card.classes()).toContain('p-5');
      });
    });
  });

  describe('Analytics Split Grid (8-col Chart + 4-col Distribution)', () => {
    it('stacks to 1 column on small viewports and spans 8/4 on large viewports (>= 1024px)', () => {
      const wrapper = mount(DashboardView);
      const analyticsSection = wrapper.find('section[aria-label="Análisis de Rendimiento"]');
      expect(analyticsSection.exists()).toBe(true);

      const classes = analyticsSection.classes();
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-1');
      expect(classes).toContain('lg:grid-cols-12');

      const chartCol = wrapper.find('.grid-col-chart');
      expect(chartCol.classes()).toContain('lg:col-span-8');

      const distCol = wrapper.find('.grid-col-distribution');
      expect(distCol.classes()).toContain('lg:col-span-4');
    });

    it('renders FluencyChart with responsive SVG and adaptable layout', () => {
      const wrapper = mount(FluencyChart);
      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      expect(svg.attributes('preserveAspectRatio')).toBe('none');
      expect(wrapper.find('.insight-callout').exists()).toBe(true);
    });

    it('renders LevelsDistribution with responsive progress tracks', () => {
      const wrapper = mount(LevelsDistribution);
      const items = wrapper.findAll('.level-item');
      expect(items.length).toBe(4);
      items.forEach(item => {
        const track = item.find('.progress-track');
        expect(track.exists()).toBe(true);
      });
    });
  });

  describe('RecentAssessmentsTable Responsive Scrolling', () => {
    it('has an overflow-x-auto container for smooth touch scrolling on tablet and mobile', () => {
      const wrapper = mount(RecentAssessmentsTable);
      const scrollCanvas = wrapper.find('.overflow-x-auto');
      expect(scrollCanvas.exists()).toBe(true);
      expect(scrollCanvas.find('table').exists()).toBe(true);
    });

    it('wraps toolbar controls responsively on small viewports', () => {
      const wrapper = mount(RecentAssessmentsTable);
      const toolbar = wrapper.find('.toolbar-container');
      expect(toolbar.exists()).toBe(true);
      const classes = toolbar.classes();
      expect(classes).toContain('flex');
      expect(classes).toContain('flex-col');
      expect(classes).toContain('sm:flex-row');
    });
  });

  describe('DashboardLayout Responsive Features', () => {
    it('renders clean content canvas without unnecessary top bar', () => {
      const wrapper = mount(DashboardLayout);
      const topBar = wrapper.find('header.stitch-top-navbar');
      expect(topBar.exists()).toBe(false);
      expect(wrapper.find('.stitch-content-canvas').exists()).toBe(true);
    });

    it('hides unnecessary elements (academic session card, sidebar CTA) on responsive viewports', () => {
      const wrapper = mount(DashboardLayout);
      const ctaWrap = wrapper.find('.sidebar-cta-wrap');
      expect(ctaWrap.classes()).toContain('hidden');
      expect(ctaWrap.classes()).toContain('xl:block');

      const sessionCard = wrapper.find('.academic-session-card');
      expect(sessionCard.classes()).toContain('hidden');
      expect(sessionCard.classes()).toContain('xl:flex');
    });

    it('renders a mobile hamburger toggle button with accessible aria attributes', () => {
      const wrapper = mount(DashboardLayout);
      const toggleBtn = wrapper.find('.mobile-menu-toggle');
      expect(toggleBtn.exists()).toBe(true);
      expect(toggleBtn.attributes('aria-label')).toBe('Abrir menú de navegación');
    });

    it('toggles mobile menu open and closed', async () => {
      const wrapper = mount(DashboardLayout);
      const toggleBtn = wrapper.find('.mobile-menu-toggle');
      const nav = wrapper.find('.sidebar-nav');

      // Initially collapsed on mobile
      expect(nav.classes()).toContain('is-collapsed-mobile');

      // Click to open
      await toggleBtn.trigger('click');
      expect(nav.classes()).not.toContain('is-collapsed-mobile');

      // Click nav item closes menu
      const navItem = wrapper.find('.nav-item');
      await navItem.trigger('click');
      expect(nav.classes()).toContain('is-collapsed-mobile');
    });

    it('provides tooltips (title attributes) for all navigation items in tablet rail mode', () => {
      const wrapper = mount(DashboardLayout);
      const navItems = wrapper.findAll('.nav-item');
      expect(navItems.length).toBe(6);
      navItems.forEach(item => {
        expect(item.attributes('title')).toBeDefined();
        expect(item.attributes('title').length).toBeGreaterThan(0);
      });
    });
  });
});
