# Smart Canteen System

A comprehensive digital canteen management system built with React, Node.js, and Supabase.

## Features

- **QR Code Authentication**: Secure login using QR codes and PINs
- **Role-based Access**: Different interfaces for students, staff, and administrators
- **Digital Wallet**: Integrated wallet system for cashless transactions
- **Menu Management**: Dynamic menu with categories and items
- **Order Management**: Real-time order tracking with Kitchen Order Tokens (KOT)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with QR code verification

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and API keys
3. Navigate to the SQL Editor in your Supabase dashboard
4. Run the migration files in order:
   - First: `supabase/migrations/create_database_schema.sql`
   - Second: `supabase/migrations/seed_initial_data.sql`

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   ```

### 3. Installation

```bash
# Install dependencies
npm install

# Start the development server (runs both client and server)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Credentials

Use these credentials to test the application:

- **Admin**: QR Code: `DEMO_ADMIN`, PIN: `0000`
- **Staff**: QR Code: `DEMO_STAFF`, PIN: `9999`
- **Student**: QR Code: `DEMO_STUDENT`, PIN: `1234`

## Database Schema

The system uses the following main tables:

- **users**: User accounts with authentication details
- **categories**: Menu categories
- **items**: Menu items with pricing
- **orders**: Customer orders with status tracking
- **wallet_transactions**: Transaction history

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with QR code and PIN

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/profile` - Get current user profile

### Menu
- `GET /api/menu/categories` - Get all categories
- `GET /api/menu/items/:categoryId` - Get items by category
- `POST /api/menu/categories` - Create category (Admin only)
- `POST /api/menu/items` - Create menu item (Admin only)

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (Staff/Admin)
- `PATCH /api/orders/:orderId/status` - Update order status

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/recharge` - Recharge wallet (Admin only)
- `GET /api/wallet/transactions` - Get transaction history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.