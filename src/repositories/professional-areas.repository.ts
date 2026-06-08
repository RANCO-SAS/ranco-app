import { apiDelete, apiGet, apiPost } from '@/services/api/client';

export type ProfessionalServiceArea = {
  id: string;
  userId: string;
  subcategoryId: string;
  createdAt: string;
};

export const professionalAreasRepository = {
  listMine() {
    return apiGet<ProfessionalServiceArea[]>('/v1/app/professional-areas');
  },

  add(subcategoryId: string) {
    return apiPost<ProfessionalServiceArea>('/v1/app/professional-areas', { subcategoryId });
  },

  remove(areaId: string) {
    return apiDelete<{ ok: boolean }>(`/v1/app/professional-areas/${areaId}`);
  },
};
