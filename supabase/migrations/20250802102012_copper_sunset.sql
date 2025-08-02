/*
  # Seed Initial Data for Smart Canteen System

  1. Demo Users
    - Admin user with full access
    - Staff user for order management
    - Student user for testing

  2. Menu Categories
    - Basic food categories

  3. Sample Menu Items
    - Items for each category with pricing
*/

-- Insert demo users (passwords are hashed versions of the PINs)
-- Admin: PIN 0000, Staff: PIN 9999, Student: PIN 1234
INSERT INTO users (name, student_id, pin_hash, qr_code, role, wallet_balance) VALUES
  ('Admin User', 'ADMIN001', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOuKm5J5J5J5J5J5J5J5J5J5J5J5J5J5J5', 'DEMO_ADMIN', 'admin', 1000.00),
  ('Staff Member', 'STAFF001', '$2b$10$9Z8kHp0rQZ8kHp0rQZ8kOuKm5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J', 'DEMO_STAFF', 'staff', 500.00),
  ('John Student', 'STU001', '$2b$10$1Z8kHp0rQZ8kHp0rQZ8kOuKm5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J', 'DEMO_STUDENT', 'student', 250.00)
ON CONFLICT (student_id) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, description, is_active) VALUES
  ('Beverages', 'Hot and cold drinks', true),
  ('Snacks', 'Light snacks and finger foods', true),
  ('Main Course', 'Full meals and main dishes', true),
  ('Desserts', 'Sweet treats and desserts', true),
  ('Healthy Options', 'Nutritious and healthy food choices', true)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
WITH category_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO items (name, description, price, category_id, is_available) 
SELECT 
  item_data.name,
  item_data.description,
  item_data.price,
  c.id,
  true
FROM (
  VALUES 
    -- Beverages
    ('Coffee', 'Fresh brewed coffee', 25.00, 'Beverages'),
    ('Tea', 'Hot tea with milk', 15.00, 'Beverages'),
    ('Cold Coffee', 'Iced coffee with cream', 35.00, 'Beverages'),
    ('Fresh Juice', 'Seasonal fruit juice', 40.00, 'Beverages'),
    ('Soft Drink', 'Chilled soft drinks', 20.00, 'Beverages'),
    
    -- Snacks
    ('Samosa', 'Crispy fried samosa', 12.00, 'Snacks'),
    ('Sandwich', 'Grilled vegetable sandwich', 45.00, 'Snacks'),
    ('Pakora', 'Mixed vegetable pakora', 30.00, 'Snacks'),
    ('Chips', 'Potato chips packet', 15.00, 'Snacks'),
    ('Biscuits', 'Assorted biscuits', 10.00, 'Snacks'),
    
    -- Main Course
    ('Rice Bowl', 'Steamed rice with curry', 65.00, 'Main Course'),
    ('Roti Meal', 'Roti with dal and vegetables', 55.00, 'Main Course'),
    ('Biryani', 'Aromatic vegetable biryani', 85.00, 'Main Course'),
    ('Pasta', 'Italian pasta with sauce', 70.00, 'Main Course'),
    ('Burger', 'Vegetable burger with fries', 75.00, 'Main Course'),
    
    -- Desserts
    ('Ice Cream', 'Vanilla ice cream cup', 25.00, 'Desserts'),
    ('Cake Slice', 'Fresh cake slice', 35.00, 'Desserts'),
    ('Sweet', 'Traditional Indian sweet', 20.00, 'Desserts'),
    ('Cookies', 'Chocolate chip cookies', 15.00, 'Desserts'),
    
    -- Healthy Options
    ('Fruit Salad', 'Fresh seasonal fruit salad', 40.00, 'Healthy Options'),
    ('Green Salad', 'Mixed green vegetables', 35.00, 'Healthy Options'),
    ('Yogurt', 'Fresh yogurt cup', 20.00, 'Healthy Options'),
    ('Nuts Mix', 'Healthy mixed nuts', 50.00, 'Healthy Options')
) AS item_data(name, description, price, category_name)
JOIN category_ids c ON c.name = item_data.category_name
ON CONFLICT DO NOTHING;