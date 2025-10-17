import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: 'customer' | 'rider' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Rider {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  license_number: string;
  vehicle_type: string;
  vehicle_registration: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_active: boolean;
  balance: number;
  total_earnings: number;
  documents: {
    id_copy?: string;
    license_copy?: string;
    vehicle_insurance?: string;
    vehicle_inspection?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  rider_id?: string;
  pickup_location: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  delivery_location: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    weight?: number;
    value?: number;
  }>;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'mpesa' | 'paypal' | 'cash_on_delivery';
  total_amount: number;
  delivery_fee: number;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  rider_id?: string;
  rider_name?: string;
  type: 'status_change' | 'payment_received' | 'order_completed' | 'earnings_added' | 'withdrawal_requested' | 'system_event';
  description: string;
  amount?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Location {
  id: string;
  name: string;
  place_name: string;
  center: [number, number];
  tags: Record<string, any>;
  source: string;
  created_at: string;
}

export interface ResetToken {
  token: string;
  email: string;
  expires: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  rider_id?: string;
  amount: number;
  payment_method: 'mpesa' | 'paypal' | 'cash_on_delivery';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  mpesa_receipt?: string;
  paypal_order_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface Withdrawal {
  id: string;
  rider_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: 'mpesa';
  mpesa_phone: string;
  transaction_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PartnershipRequest {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  business_type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at?: string;
}
