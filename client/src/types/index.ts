export interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  community: string | null;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  property_type: string;
  furnished: number;
  pet_friendly: number;
  description: string | null;
  amenities: string[];
  photos: string[];
  availability_date: string | null;
  status: 'available' | 'occupied' | 'maintenance';
  zillow_url?: string | null;
  lot_size?: number | null;
  year_built?: number | null;
  listing_status?: string | null;
  initial_monthly_rent?: number | null;
  current_monthly_rent?: number | null;
  sold_price?: number | null;
  source_row?: number | null;
  created_at: string;
}

export interface Lead {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  interest_type: 'renting' | 'investing';
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  property_id: number | null;
  property_title: string | null;
  property_address: string | null;
  contacted: number;
  source: string;
  created_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}
