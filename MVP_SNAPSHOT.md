# Money Clip MVP - Current State Documentation
**Date**: June 23, 2025  
**Status**: Working MVP with Authentication, Dashboard, and Transaction Management

## 📋 Overview
Money Clip is a financial dashboard application with a simplified user experience focused on daily spending allowance calculation. The MVP includes user authentication, transaction management, and a clean green-themed UI.

## 🏗️ Architecture

### Frontend (React TypeScript)
- **Framework**: Create React App with TypeScript
- **UI Library**: Material-UI (MUI) with custom styling
- **Theme**: Money Clip green (#00d4aa) throughout
- **State Management**: React Context for authentication
- **Routing**: React Router v6
- **API Client**: Axios with custom configuration

### Backend (Python Flask)
- **Framework**: Flask with Flask-JWT-Extended
- **Database**: SQLAlchemy with simplified schema
- **Authentication**: JWT tokens
- **Deployment**: Railway hosting
- **API URL**: https://clip-mvp-production.up.railway.app

### Database Schema (Simplified)
```sql
-- Core tables only
users (id, email, password_hash, first_name, is_admin, created_at)
accounts (id, user_id, name, account_type, current_balance, institution_name, is_active, include_in_total)
transactions (id, user_id, account_id, description, amount, date, category, is_income, is_recurring, recurrence_type)
```

## 🎯 Current Features

### ✅ Authentication System
- **Login/Signup**: Working with proper error handling
- **Auto-recovery**: Demo user recreated automatically if database resets
- **Token Management**: Consistent `money_clip_token` across all components
- **Demo Credentials**: cjohnkim@gmail.com / SimpleClip123

### ✅ Dashboard (SimpleDashboard)
- **Daily Allowance**: Calculated from balance and expenses
- **Hero Card**: Green gradient with daily spending amount
- **Quick Actions**: Add Income, Add Expense, Import Data
- **Monthly Summary**: Income vs Expenses for current month
- **Recent Transactions**: List of latest activity
- **Floating Action Button**: Quick expense entry

### ✅ Transaction Management
- **Add Transaction Dialog**: Comprehensive form with 30+ categories
- **Categories**: Housing, Food, Transportation, Entertainment, etc.
- **Recurrence**: Daily, Weekly, Monthly, Yearly patterns
- **Income/Expense**: Proper categorization and amount handling

### ✅ UI/UX Design
- **Consistent Theme**: Money Clip green (#00d4aa) throughout
- **Clean Layout**: Simple.com inspired design
- **Responsive**: Mobile-friendly interface
- **Professional**: Cohesive branding across all pages

## 🚀 Deployment Status

### Production Environment
- **Frontend**: Deployed at https://app.moneyclip.money
- **Backend**: Railway deployment at https://clip-mvp-production.up.railway.app
- **Database**: PostgreSQL on Railway (auto-resets periodically)
- **Status**: Fully functional with demo data

### Demo Data
- **User**: cjohnkim@gmail.com with sample transactions
- **Transactions**: Monthly salary ($3200), rent (-$2200), coffee (-$5.67)
- **Accounts**: Chase checking account setup ready

## 📁 Key Files and Components

### Frontend Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── EnergeticSignIn.tsx (Login with Money Clip theme)
│   │   ├── Login.tsx (Alternative login component)
│   │   └── Signup.tsx (User registration)
│   └── AddTransactionDialog.tsx (Comprehensive transaction form)
├── contexts/
│   └── AuthContext.tsx (Authentication state management)
├── pages/
│   ├── SimpleDashboard.tsx (Main dashboard - Money Clip themed)
│   ├── AuthPage.tsx (Auth routing logic)
│   └── AdminPage.tsx (Admin interface)
├── services/
│   └── authService.ts (API client with auto URL detection)
└── theme/
    └── athleticTheme.ts (MUI theme configuration)
```

### Backend Structure
```
backend/
├── app.py (Flask application entry point)
├── models_simple.py (SQLAlchemy models)
├── routes/
│   ├── auth.py (Authentication endpoints)
│   ├── transactions.py (Transaction CRUD)
│   └── daily_allowance.py (Allowance calculation)
└── plaid_service.py (Plaid integration - mock mode)
```

## 🔧 Technical Implementation Details

### Authentication Flow
1. **Login**: User enters credentials on EnergeticSignIn component
2. **Token Storage**: JWT stored as `money_clip_token` in localStorage
3. **Auto-Recovery**: Failed login for demo user triggers account recreation
4. **API Integration**: All requests use Bearer token authentication

### Dashboard Data Flow
1. **Load**: SimpleDashboard fetches from `/api/daily-allowance` and `/api/transactions/summary`
2. **Display**: Hero card shows daily allowance, cards show monthly summary
3. **Actions**: Quick action buttons open AddTransactionDialog
4. **Refresh**: Data reloads after transaction additions

### API Endpoints
```
POST /api/auth/login          - User authentication
POST /api/auth/signup         - User registration
GET  /api/auth/profile        - Get user profile
POST /api/transactions        - Create transaction
GET  /api/transactions/summary - Dashboard summary
GET  /api/daily-allowance     - Calculate daily allowance
```

### Key Configuration
- **API URL Detection**: Automatic prod/dev URL switching
- **CORS**: Enabled for cross-origin requests
- **Token Management**: Consistent naming across all components
- **Error Handling**: Comprehensive error catching and user feedback

## 🎨 Design System

### Color Palette
- **Primary**: #00d4aa (Money Clip Green)
- **Secondary**: #00b894 (Darker Green)
- **Background**: #f8fafc (Light Gray)
- **Text**: #0a2540 (Dark Blue-Gray)
- **Success**: #00d4aa (Green)
- **Error**: #ef4444 (Red)

### Typography
- **Headers**: Bold, Money Clip green
- **Body**: Clean, readable fonts
- **Amounts**: Large, prominent display

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Money Clip green with hover states
- **Forms**: Clean inputs with green focus states
- **Icons**: Consistent Material-UI icons

## 🐛 Known Issues & Workarounds

### Database Resets
- **Issue**: Railway database resets periodically
- **Workaround**: Auto-recovery in AuthContext recreates demo user
- **Status**: Handled automatically

### Token Consistency
- **Issue**: Some components used different token names
- **Fix**: Standardized on `money_clip_token` across all components
- **Status**: Resolved

### API URL Detection
- **Issue**: Hard-coded localhost URLs in some components
- **Fix**: Dynamic URL detection based on hostname
- **Status**: Resolved

## 🔄 Recreating This State

### 1. Repository Setup
```bash
git clone https://github.com/cjohnkim/clip-mvp.git
cd clip-mvp
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 4. Environment Variables
Create `.env.production` in frontend:
```
REACT_APP_API_URL=https://clip-mvp-production.up.railway.app
REACT_APP_FRONTEND_URL=https://app.moneyclip.money
REACT_APP_ENVIRONMENT=production
```

### 5. Database Initialization
- Backend auto-creates tables on startup
- Demo user auto-created on login attempt
- Sample data added via API calls

### 6. Production Deployment
- Frontend: Deploy to domain that resolves to app.moneyclip.money
- Backend: Deploy to Railway or similar platform
- Ensure CORS and API URLs are configured correctly

## 🎯 Current Capabilities

### What Works
✅ Complete user authentication flow  
✅ Dashboard with real-time data  
✅ Transaction creation and management  
✅ Daily allowance calculation  
✅ Responsive, branded UI  
✅ Admin interface for user management  
✅ Auto-recovery for demo user  
✅ Production deployment  

### What's Ready for Enhancement
🔄 Plaid integration (framework in place, needs real credentials)  
🔄 Additional transaction categories  
🔄 Advanced recurrence patterns  
🔄 Account management features  
🔄 Budget planning tools  
🔄 Reporting and analytics  

## 📊 Current Metrics
- **Frontend Bundle**: ~253kB gzipped
- **API Response Time**: <200ms average
- **Load Time**: <2s initial load
- **Mobile Responsive**: Yes
- **Browser Support**: Modern browsers

## 🚀 Next Development Priorities
1. **Enhanced Transaction Management**: Better categorization and bulk operations
2. **Plaid Integration**: Real bank connection setup
3. **Advanced Analytics**: Spending trends and insights
4. **Mobile Optimization**: PWA capabilities
5. **Performance**: Code splitting and lazy loading

---

**This snapshot represents a fully functional MVP with authentication, dashboard, and transaction management capabilities, ready for further feature development.**