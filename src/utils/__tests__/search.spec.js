import { describe, it, expect } from 'vitest';
import { normalizeSearchTerm, matchesQuery } from '@/utils/search';

describe('normalizeSearchTerm', () => {
  it('elimina acentos y pasa a minúsculas', () => {
    expect(normalizeSearchTerm('Álvaro Pérez Gil')).toBe('alvaro perez gil');
    expect(normalizeSearchTerm('MARÍA')).toBe('maria');
    expect(normalizeSearchTerm('Íñigo')).toBe('inigo');
  });

  it('recorta espacios extremos', () => {
    expect(normalizeSearchTerm('  lucía  ')).toBe('lucia');
  });

  it('tolera valores nulos', () => {
    expect(normalizeSearchTerm(null)).toBe('');
    expect(normalizeSearchTerm(undefined)).toBe('');
  });
});

describe('matchesQuery', () => {
  it('casa sin acentos y en minúsculas (Escenario 2)', () => {
    expect(matchesQuery('María García López', 'maria')).toBe(true);
    expect(matchesQuery('María García López', 'GARCIA')).toBe(true);
    expect(matchesQuery('Nora Alvarez Soto', 'álvarez')).toBe(true);
  });

  it('no casa si el nombre no contiene el fragmento', () => {
    expect(matchesQuery('Lucía Fernández Ortiz', 'iker')).toBe(false);
  });

  it('casa por fragmento parcial', () => {
    expect(matchesQuery('Daniel Martínez Ruiz', 'mart')).toBe(true);
  });

  it('falso con consulta vacía', () => {
    expect(matchesQuery('María García López', '')).toBe(false);
    expect(matchesQuery('María García López', '  ')).toBe(false);
  });
});