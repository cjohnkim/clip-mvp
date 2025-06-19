# Money Clip MVP - Development Setup

## Quick Start

### Backend Setup (Flask)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend server:**
   ```bash
   python run.py
   ```

   The API will be available at: http://localhost:5000/api

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Planning
- `GET /api/planning/accounts` - Get accounts
- `POST /api/planning/accounts` - Create account
- `GET /api/planning/expenses` - Get planned expenses
- `POST /api/planning/expenses` - Add expense
- `GET /api/planning/income` - Get planned income
- `POST /api/planning/income` - Add income

### Calculation
- `GET /api/calculation/daily-clip` - Get daily spending capacity
- `POST /api/calculation/scenario` - Test spending scenario
- `GET /api/calculation/cash-flow` - Get 30-day timeline

## Testing the Application

1. **Start both backend and frontend servers**

2. **Create an account:**
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Enter email and password

3. **Complete setup:**
   - Add your current account balance
   - Set up paycheck schedule

4. **Add planned expenses:**
   - Go to Planning tab
   - Add upcoming bills and expenses

5. **View your daily clip:**
   - Return to Dashboard
   - See calculated daily spending capacity

## Architecture

- **Backend:** Flask + SQLAlchemy + SQLite
- **Frontend:** React + TypeScript + Material-UI
- **API:** RESTful with JWT authentication
- **Database:** SQLite for simplicity

## Core Features Implemented

✅ User authentication and registration  
✅ Account balance management  
✅ Paycheck scheduling  
✅ Planned expense tracking  
✅ Planned income tracking  
✅ Daily clip calculation algorithm  
✅ Scenario testing ("what if" modeling)  
✅ Cash flow timeline generation  
✅ Responsive Material-UI interface  

## Next Steps for Development

1. **Add cash flow visualization** (charts)
2. **Implement scenario testing UI**
3. **Add expense categories**
4. **Create mobile-responsive timeline view**
5. **Add data export features**
6. **Implement recurring expense automation**

## Database Schema

The SQLite database includes:
- `users` - User accounts
- `accounts` - Bank/financial accounts  
- `planned_expenses` - Upcoming expenses
- `planned_income` - Expected income
- `paycheck_schedules` - Regular income timing

## Development Tips

- Backend auto-reloads on file changes
- Frontend hot-reloads for instant preview
- Check browser console for errors
- API responses include detailed error messages
- Database is created automatically on first run

## API Testing

Use the health check endpoint to verify backend:
```bash
curl http://localhost:5000/api/health
```

Example API calls:
```bash
# Create account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get daily clip (requires auth token)
curl -X GET http://localhost:5000/api/calculation/daily-clip \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```