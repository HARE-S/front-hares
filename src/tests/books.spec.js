import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { 
  BOOK_LEVELS, 
  compareBookLevels, 
  calculateReadingDuration, 
  getBooks, 
  createBook, 
  updateBook, 
  assignBook, 
  closeReading, 
  reopenReading 
} from '../services/booksService';
import BookLevelBadge from '../components/books/BookLevelBadge.vue';
import BookFormModal from '../components/books/BookFormModal.vue';
import AssignBookModal from '../components/books/AssignBookModal.vue';
import BooksCatalogView from '../views/books-catalog/BooksCatalogView.vue';

describe('Módulo 2 — Catálogo de Libros y Lecturas (FE-17, FE-21, FE-22)', () => {

  describe('FE-17: Catálogo de Libros', () => {
    it('FE-17 Escenario 2: Los niveles pedagógicos corresponden exactamente a la notación oficial del centro', () => {
      expect(BOOK_LEVELS).toEqual(['0', '0-I', 'I', 'I/II', 'II']);

      BOOK_LEVELS.forEach(lvl => {
        const wrapper = mount(BookLevelBadge, {
          props: { level: lvl }
        });
        expect(wrapper.text()).toContain(`Nivel ${lvl}`);
      });
    });

    it('FE-17 Escenario 3: La ordenación es estrictamente pedagógica (0 -> 0-I -> I -> I/II -> II) y no alfabética', () => {
      const unorderedLevels = ['II', '0-I', 'I/II', '0', 'I'];
      const sorted = [...unorderedLevels].sort(compareBookLevels);

      expect(sorted).toEqual(['0', '0-I', 'I', 'I/II', 'II']);

      // Verificación de que I/II va antes de II en la pedagogía del centro
      expect(compareBookLevels('I/II', 'II')).toBeLessThan(0);
      expect(compareBookLevels('0', '0-I')).toBeLessThan(0);
      expect(compareBookLevels('0-I', 'I')).toBeLessThan(0);
    });

    it('FE-17 Escenario 1 y 5: Obtiene listado de libros con ejemplares libres y permite filtrar por nivel', async () => {
      const res = await getBooks({ level: '0-I' });
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.items.every(b => b.level === '0-I')).toBe(true);

      const bookWithCopies = res.items.find(b => b.title === 'El pequeño conejo blanco');
      expect(bookWithCopies).toBeDefined();
      expect(bookWithCopies.copies).toBe('11 fotocopias');
    });

    it('FE-17 Escenario 4: Valida alta y rechaza títulos duplicados con mensaje amigable (409 Conflict)', async () => {
      const uniqueTitle = `Libro Test ${Date.now()}`;
      const newBook = await createBook({
        title: uniqueTitle,
        author: 'Autor de Prueba',
        level: 'I',
        copies: '5 fotocopias'
      });
      expect(newBook.title).toBe(uniqueTitle);

      // Intento de duplicado
      await expect(createBook({
        title: uniqueTitle,
        author: 'Otro Autor',
        level: '0'
      })).rejects.toThrow('Ese título de libro ya existe en el catálogo');
    });

    it('FE-17 Control por rol: Oculta los botones de creación y edición si el usuario es tutor', () => {
      const coordinatorView = mount(BooksCatalogView, {
        props: { userRole: 'coordinator' }
      });
      expect(coordinatorView.text()).toContain('Nuevo Libro');

      const tutorView = mount(BooksCatalogView, {
        props: { userRole: 'tutor' }
      });
      expect(tutorView.text()).not.toContain('Nuevo Libro');
    });
  });

  describe('FE-21: Asignar un Libro a un Alumno', () => {
    it('FE-21 Escenario 1 y 2: Registra lectura con fecha de inicio, omitiendo fecha fin queda en curso', async () => {
      const reading = await assignBook({
        student_id: 1,
        student_name: 'Lucas Méndez Ruiz',
        book_id: 1,
        start_date: '2025-02-01',
        end_date: ''
      });

      expect(reading.student_name).toBe('Lucas Méndez Ruiz');
      expect(reading.start_date).toBe('2025-02-01');
      expect(reading.end_date).toBeNull();
      expect(reading.status).toBe('en_curso');
    });

    it('FE-21 Escenario 3 y 4: Modal filtra libros en tiempo real y excluye libros dados de baja', async () => {
      const wrapper = mount(AssignBookModal, {
        props: { isOpen: true }
      });

      // Esperar a que resuelvan las promesas de carga
      await flushPromises();

      const searchInput = wrapper.find('.pl-search');
      expect(searchInput.exists()).toBe(true);

      // Libro dado de baja ('Cuentos de la selva') no debe aparecer
      expect(wrapper.text()).not.toContain('Cuentos de la selva');

      // Búsqueda de 'conejo'
      await searchInput.setValue('conejo');
      await flushPromises();
      expect(wrapper.text()).toContain('El pequeño conejo blanco');
      expect(wrapper.text()).not.toContain('El bosque animado');
    });

    it('FE-21 Escenario 5: Soporta relectura permitiendo asignar de nuevo un mismo libro en otra fecha', async () => {
      const reading1 = await assignBook({
        student_id: 2,
        book_id: 3,
        start_date: '2024-10-01',
        end_date: '2024-10-20'
      });

      const reading2 = await assignBook({
        student_id: 2,
        book_id: 3,
        start_date: '2025-02-01',
        end_date: null
      });

      expect(reading1.id).not.toBe(reading2.id);
      expect(reading1.book_id).toBe(reading2.book_id);
    });
  });

  describe('FE-22: Cerrar y Reabrir una Lectura', () => {
    it('FE-22 Escenario 1: Cierra lectura, pasa a finalizada y calcula duración en días naturales', async () => {
      const closed = await closeReading(102, { end_date: '2025-01-20' });
      expect(closed.status).toBe('finalizada');
      expect(closed.end_date).toBe('2025-01-20');

      // Duración entre 2025-01-12 y 2025-01-20
      const days = calculateReadingDuration('2025-01-12', '2025-01-20');
      expect(days).toBe(8);
    });

    it('FE-22 Escenario 3: Rechaza fechas incoherentes si la fecha de fin es anterior a la de inicio (422)', async () => {
      await expect(closeReading(103, { end_date: '2025-01-01' }))
        .rejects
        .toThrow('La fecha de fin no puede ser anterior a la de inicio');
    });

    it('FE-22 Escenario 4: Reabre lectura finalizada devolviéndola a "en_curso" conservando fecha de inicio', async () => {
      const reopened = await reopenReading(101);
      expect(reopened.status).toBe('en_curso');
      expect(reopened.end_date).toBeNull();
      expect(reopened.start_date).toBe('2025-01-10');
    });

    it('FE-22 Escenario 5: Vista de lecturas permite filtrar por estado (Todas, En curso, Finalizadas)', async () => {
      const wrapper = mount(BooksCatalogView);
      await flushPromises();

      // Cambiar a la pestaña de lecturas
      const tabs = wrapper.findAll('.tab-btn');
      await tabs[1].trigger('click');

      expect(wrapper.text()).toContain('Lecturas del Aula');
      expect(wrapper.find('.segmented-control').exists()).toBe(true);

      const filterButtons = wrapper.findAll('.seg-item');
      expect(filterButtons.length).toBe(3);

      // Filtrar por en curso
      await filterButtons[1].trigger('click');
      expect(filterButtons[1].classes()).toContain('active');
    });
  });

});
