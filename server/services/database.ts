import { supabase, User, Rider, Order, Activity, Location, ResetToken, Payment, Withdrawal, PartnershipRequest, Message } from '../lib/supabase';

export class DatabaseService {
  private static checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please run "npm run setup:supabase" to configure your database.');
    }
  }

  // Users
  static async getUsers(): Promise<User[]> {
    this.checkSupabase();
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getUserById(id: string): Promise<User | null> {
    this.checkSupabase();
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Riders
  static async getRiders(): Promise<Rider[]> {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getRiderById(id: string): Promise<Rider | null> {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getRiderByUserId(userId: string): Promise<Rider | null> {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createRider(rider: Omit<Rider, 'id' | 'created_at' | 'updated_at'>): Promise<Rider> {
    const { data, error } = await supabase
      .from('riders')
      .insert([rider])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateRider(id: string, updates: Partial<Rider>): Promise<Rider> {
    const { data, error } = await supabase
      .from('riders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteRider(id: string): Promise<void> {
    const { error } = await supabase
      .from('riders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getOrdersByRider(riderId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('rider_id', riderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Activities
  static async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getActivitiesByRider(riderId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('rider_id', riderId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Locations
  static async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getLocationById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createLocation(location: Omit<Location, 'created_at'>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteLocation(id: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Reset Tokens
  static async getResetToken(token: string): Promise<ResetToken | null> {
    const { data, error } = await supabase
      .from('reset_tokens')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createResetToken(token: ResetToken): Promise<ResetToken> {
    const { data, error } = await supabase
      .from('reset_tokens')
      .insert([token])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteResetToken(token: string): Promise<void> {
    const { error } = await supabase
      .from('reset_tokens')
      .delete()
      .eq('token', token);
    
    if (error) throw error;
  }

  static async deleteExpiredTokens(): Promise<void> {
    const now = Date.now();
    const { error } = await supabase
      .from('reset_tokens')
      .delete()
      .lt('expires', now);
    
    if (error) throw error;
  }

  // Payments
  static async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Withdrawals
  static async getWithdrawals(): Promise<Withdrawal[]> {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getWithdrawalsByRider(riderId: string): Promise<Withdrawal[]> {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('rider_id', riderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'created_at' | 'updated_at'>): Promise<Withdrawal> {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([withdrawal])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal> {
    const { data, error } = await supabase
      .from('withdrawals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Partnership Requests
  static async getPartnershipRequests(): Promise<PartnershipRequest[]> {
    const { data, error } = await supabase
      .from('partnership_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getPartnershipRequestById(id: string): Promise<PartnershipRequest | null> {
    const { data, error } = await supabase
      .from('partnership_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createPartnershipRequest(request: Omit<PartnershipRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PartnershipRequest> {
    const { data, error } = await supabase
      .from('partnership_requests')
      .insert([request])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePartnershipRequest(id: string, updates: Partial<PartnershipRequest>): Promise<PartnershipRequest> {
    const { data, error } = await supabase
      .from('partnership_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePartnershipRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('partnership_requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Messages
  static async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getMessageById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
