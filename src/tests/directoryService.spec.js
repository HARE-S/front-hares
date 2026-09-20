import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
  request: vi.fn()
}));

import { getCenters, getCenterSections, getSectionStudents } from '@/services/directoryService';
import { request } from '@/services/api';

describe('directoryService (FE-25)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCenters solicita /centers y devuelve los centros con su recuento', async () => {
    const payload = [
      { id: 'c-1', name: 'Centro Norte', sections_count: 3 },
      { id: 'c-2', name: 'Centro Sur', sections_count: 1 }
    ];
    request.mockResolvedValue(payload);

    const data = await getCenters();

    expect(request).toHaveBeenCalledWith('/centers');
    expect(data).toEqual(payload);
  });

  it('getCenterSections solicita /centers/:id/sections y devuelve las secciones con alumnos', async () => {
    const payload = [
      { id: 's-1', name: '1º ESO A', center_id: 'c-1', students_count: 2 }
    ];
    request.mockResolvedValue(payload);

    const data = await getCenterSections('c-1');

    expect(request).toHaveBeenCalledWith('/centers/c-1/sections');
    expect(data).toEqual(payload);
  });

  it('getSectionStudents solicita /sections/:id/students y devuelve el alumnado', async () => {
    const payload = [
      { id: 'stu-1', name: 'Aitor Ortiz', external_id: 'AIT-001' }
    ];
    request.mockResolvedValue(payload);

    const data = await getSectionStudents('s-1');

    expect(request).toHaveBeenCalledWith('/sections/s-1/students');
    expect(data).toEqual(payload);
  });
});