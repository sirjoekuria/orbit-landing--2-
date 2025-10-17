-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT 'USR-' || LPAD(nextval('user_seq')::text, 3, '0'),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'rider', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for user IDs
CREATE SEQUENCE user_seq START 1;

-- Riders table (extends users)
CREATE TABLE riders (
  id TEXT PRIMARY KEY DEFAULT 'RD-' || LPAD(nextval('rider_seq')::text, 3, '0'),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_registration TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_active BOOLEAN DEFAULT true,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  documents JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for rider IDs
CREATE SEQUENCE rider_seq START 1;

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT 'ORD-' || LPAD(nextval('order_seq')::text, 3, '0'),
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rider_id TEXT REFERENCES riders(id) ON DELETE SET NULL,
  pickup_location JSONB NOT NULL,
  delivery_location JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'paypal', 'cash_on_delivery')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for order IDs
CREATE SEQUENCE order_seq START 1;

-- Activities table
CREATE TABLE activities (
  id TEXT PRIMARY KEY DEFAULT 'ACT-' || LPAD(nextval('activity_seq')::text, 3, '0'),
  rider_id TEXT REFERENCES riders(id) ON DELETE SET NULL,
  rider_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'payment_received', 'order_completed', 'earnings_added', 'withdrawal_requested', 'system_event')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for activity IDs
CREATE SEQUENCE activity_seq START 1;

-- Locations table
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  place_name TEXT NOT NULL,
  center POINT NOT NULL,
  tags JSONB DEFAULT '{}',
  source TEXT DEFAULT 'overpass',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reset tokens table
CREATE TABLE reset_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY DEFAULT 'PAY-' || LPAD(nextval('payment_seq')::text, 3, '0'),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rider_id TEXT REFERENCES riders(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'paypal', 'cash_on_delivery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  mpesa_receipt TEXT,
  paypal_order_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for payment IDs
CREATE SEQUENCE payment_seq START 1;

-- Withdrawals table
CREATE TABLE withdrawals (
  id TEXT PRIMARY KEY DEFAULT 'WD-' || LPAD(nextval('withdrawal_seq')::text, 3, '0'),
  rider_id TEXT REFERENCES riders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT DEFAULT 'mpesa' CHECK (payment_method = 'mpesa'),
  mpesa_phone TEXT NOT NULL,
  transaction_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for withdrawal IDs
CREATE SEQUENCE withdrawal_seq START 1;

-- Partnership requests table
CREATE TABLE partnership_requests (
  id TEXT PRIMARY KEY DEFAULT 'PR-' || LPAD(nextval('partnership_seq')::text, 3, '0'),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for partnership request IDs
CREATE SEQUENCE partnership_seq START 1;

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT 'MSG-' || LPAD(nextval('message_seq')::text, 3, '0'),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for message IDs
CREATE SEQUENCE message_seq START 1;

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_riders_user_id ON riders(user_id);
CREATE INDEX idx_riders_status ON riders(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_rider_id ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_activities_rider_id ON activities(rider_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_withdrawals_rider_id ON withdrawals(rider_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_reset_tokens_email ON reset_tokens(email);
CREATE INDEX idx_reset_tokens_expires ON reset_tokens(expires);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnership_requests_updated_at BEFORE UPDATE ON partnership_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these based on your needs)
-- For now, allowing all operations for authenticated users
-- You should implement more specific policies based on user roles

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Riders policies
CREATE POLICY "Riders can view their own data" ON riders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Riders can update their own data" ON riders FOR UPDATE USING (auth.uid()::text = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid()::text = customer_id);
CREATE POLICY "Riders can view assigned orders" ON orders FOR SELECT USING (auth.uid()::text = rider_id);

-- Activities policies
CREATE POLICY "Riders can view their own activities" ON activities FOR SELECT USING (auth.uid()::text = rider_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid()::text = customer_id);
CREATE POLICY "Riders can view their payments" ON payments FOR SELECT USING (auth.uid()::text = rider_id);

-- Withdrawals policies
CREATE POLICY "Riders can view their own withdrawals" ON withdrawals FOR SELECT USING (auth.uid()::text = rider_id);

-- Public read access for locations
CREATE POLICY "Locations are publicly readable" ON locations FOR SELECT USING (true);

-- Messages policies (admin only for now)
CREATE POLICY "Messages are publicly readable" ON messages FOR SELECT USING (true);

-- Partnership requests policies
CREATE POLICY "Partnership requests are publicly readable" ON partnership_requests FOR SELECT USING (true);
