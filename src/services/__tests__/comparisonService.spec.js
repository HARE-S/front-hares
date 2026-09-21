import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/services/api';
import { getGroupComparison } from '@/services/comparisonService';

vi.mock('@/services/api', () => ({
  request: vi.fn()
}));

describe('comparisonService (FE-32 / BE-32)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('solicita en modo sección con group_by y section_ids repetidos', async () => {
    api.request.mockResolvedValue({});

    await getGroupComparison({
      groupBy: 'section',
      sectionIds: ['s-1', 's-2'],
      centerId: 'c-1'
    });

    expect(api.request).toHaveBeenCalledWith(
      '/comparison/groups?group_by=section&section_ids=s-1&section_ids=s-2&center_id=c-1'
    );
  });

  it('modo centro: solo group_by y sin acotar por centro', async () => {
    api.request.mockResolvedValue({});

    await getGroupComparison({ groupBy: 'center' });

    expect(api.request).toHaveBeenCalledWith('/comparison/groups?group_by=center');
  });

  it('incluye min_sample, start_date y end_date cuando se definen', async () => {
    api.request.mockResolvedValue({});

    await getGroupComparison({
      groupBy: 'profile',
      minSample: 3,
      startDate: '2025-09-01',
      endDate: '2026-06-30'
    });

    expect(api.request).toHaveBeenCalledWith(
      '/comparison/groups?group_by=profile&min_sample=3&start_date=2025-09-01&end_date=2026-06-30'
    );
  });

  it('no añade min_sample vacío ni fechas vacías', async () => {
    api.request.mockResolvedValue({});

    await getGroupComparison({ groupBy: 'profile', minSample: '', startDate: null, endDate: '' });

    expect(api.request).toHaveBeenCalledWith('/comparison/groups?group_by=profile');
  });

  it('propaga el resultado del backend tal cual', async () => {
    const response = {
      group_by: 'section',
      min_sample: 5,
      groups: [{ id: 's-1', name: '1º ESO A', has_data: true }]
    };
    api.request.mockResolvedValue(response);

    await expect(
      getGroupComparison({ groupBy: 'section', sectionIds: ['s-1'] })
    ).resolves.toEqual(response);
  });
});