export type ServiceRequestRow = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  urgency: string;
  status: string;
  location_label: string | null;
  location_lat: number;
  location_lng: number;
  assigned_professional_id: string | null;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
};
