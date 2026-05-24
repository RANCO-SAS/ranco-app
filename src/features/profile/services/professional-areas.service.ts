import { getSupabaseClient } from '@/services/supabase/client';

const PROFESSIONAL_AREAS_TABLE = 'professional_service_areas';

async function getProfessionalSubcategoryIds(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFESSIONAL_AREAS_TABLE)
    .select('subcategory_id')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data.map((row) => row.subcategory_id);
}

async function replaceProfessionalSubcategories(
  userId: string,
  subcategoryIds: string[],
): Promise<string[]> {
  const supabase = getSupabaseClient();

  const { error: deleteError } = await supabase
    .from(PROFESSIONAL_AREAS_TABLE)
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    throw deleteError;
  }

  if (subcategoryIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(subcategoryIds)];
  const { error: insertError } = await supabase.from(PROFESSIONAL_AREAS_TABLE).insert(
    uniqueIds.map((subcategoryId) => ({
      user_id: userId,
      subcategory_id: subcategoryId,
    })),
  );

  if (insertError) {
    throw insertError;
  }

  return uniqueIds;
}

export const professionalAreasService = {
  getProfessionalSubcategoryIds,
  replaceProfessionalSubcategories,
};
