/*
  # Smart Canteen System Database Schema

  1. New Tables
    - `users` - Store user information with authentication details
    - `categories` - Menu categories (Drinks, Snacks, etc.)
    - `items` - Menu items with pricing and availability
    - `orders` - Customer orders with token numbers
    - `wallet_transactions` - Track wallet recharge and spending history

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure authentication using Supabase Auth

  3. Features
    - QR code generation for users
    - Wallet system with balance tracking
    - Order management with status tracking
    - Role-based permissions (student, staff, admin)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  pin_hash text NOT NULL,
  qr_code text UNIQUE NOT NULL,
  qr_code_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  wallet_balance decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  token_number integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  description text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  ));

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Create policies for categories table
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Create policies for items table
CREATE POLICY "Anyone can read available items"
  ON items
  FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can manage items"
  ON items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Create policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  ));

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Staff and admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  ));

-- Create policies for wallet_transactions table
CREATE POLICY "Users can read own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  ));

CREATE POLICY "System can create transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_qr_code ON users(qr_code);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();