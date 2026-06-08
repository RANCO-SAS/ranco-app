import {
  professionalAreasRepository,
  type ProfessionalServiceArea,
} from '@/repositories/professional-areas.repository';

async function getProfessionalSubcategoryIds(userId: string): Promise<string[]> {
  const areas = await professionalAreasRepository.listMine();
  return areas.map((area) => area.subcategoryId);
}

async function replaceProfessionalSubcategories(
  userId: string,
  subcategoryIds: string[],
): Promise<string[]> {
  const existing = await professionalAreasRepository.listMine();

  await Promise.all(existing.map((area: ProfessionalServiceArea) => professionalAreasRepository.remove(area.id)));

  if (subcategoryIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(subcategoryIds)];

  await Promise.all(uniqueIds.map((subcategoryId) => professionalAreasRepository.add(subcategoryId)));

  return uniqueIds;
}

export const professionalAreasService = {
  getProfessionalSubcategoryIds,
  replaceProfessionalSubcategories,
};
