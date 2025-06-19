# Money Clip MVP - Project Structure

## Directory Structure

```
money-clip-mvp/
├── README.md                    # Project overview
├── PROJECT_STRUCTURE.md         # This file
├── 
├── frontend/                    # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login/signup
│   │   │   ├── setup/           # Initial setup flow
│   │   │   ├── planning/        # Expense/income entry
│   │   │   ├── dashboard/       # Daily clip display
│   │   │   └── timeline/        # Cash flow visualization
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Helper functions
│   │   ├── services/            # API calls
│   │   └── App.js               # Main application
│   ├── package.json
│   └── package-lock.json
│
├── backend/                     # Flask API
│   ├── app.py                   # Main Flask application
│   ├── models.py                # Database models
│   ├── routes/                  # API endpoints
│   │   ├── auth.py              # Authentication
│   │   ├── planning.py          # Expense/income management
│   │   └── calculation.py       # Daily clip logic
│   ├── services/                # Business logic
│   │   ├── clip_calculator.py   # Core calculation engine
│   │   └── cash_flow.py         # Timeline generation
│   ├── requirements.txt         # Python dependencies
│   └── database.db              # SQLite database
│
└── docs/                        # Documentation
    ├── api.md                   # API documentation  
    ├── user-flow.md             # User experience flow
    └── calculations.md          # Daily clip algorithm
```

## Core Components

### Frontend Components

#### Authentication (`/auth/`)
- `Login.js` - Simple email/password login
- `Signup.js` - Basic account creation
- `AuthGuard.js` - Route protection

#### Setup Flow (`/setup/`)
- `Welcome.js` - Onboarding introduction
- `BalanceEntry.js` - Current balance input
- `PaycheckSetup.js` - Income scheduling
- `SetupComplete.js` - Confirmation and next steps

#### Planning (`/planning/`)
- `ExpenseEntry.js` - Add upcoming expenses
- `IncomeEntry.js` - Add expected income
- `ExpenseList.js` - View/edit planned expenses
- `QuickEntry.js` - Fast expense addition

#### Dashboard (`/dashboard/`)
- `DailyClip.js` - Main daily spending display
- `QuickStats.js` - Key metrics (days to paycheck, etc.)
- `ActionButtons.js` - Common actions (add expense, scenario)

#### Timeline (`/timeline/`)
- `CashFlowChart.js` - 30-day cash flow visualization
- `UpcomingItems.js` - Next few expenses/income
- `ScenarioTester.js` - "What if" modeling

### Backend Structure

#### Models (`models.py`)
```python
class User:
    - id, email, password_hash, created_at

class Account:
    - id, user_id, name, current_balance, updated_at

class PlannedExpense:
    - id, user_id, name, amount, due_date, is_recurring, created_at

class PlannedIncome:
    - id, user_id, name, amount, expected_date, frequency, created_at

class PaycheckSchedule:
    - id, user_id, amount, frequency, next_date, day_of_month
```

#### API Routes

**Authentication** (`/auth/`)
- `POST /login` - User authentication
- `POST /signup` - Account creation
- `POST /logout` - Session termination

**Planning** (`/planning/`)
- `GET /expenses` - List planned expenses
- `POST /expenses` - Add new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Remove expense
- `GET /income` - List expected income
- `POST /income` - Add income
- `PUT /income/:id` - Update income

**Calculation** (`/calculation/`)
- `GET /daily-clip` - Current daily spending capacity
- `POST /scenario` - Test spending scenario
- `GET /cash-flow` - 30-day timeline data

#### Core Services

**Clip Calculator** (`clip_calculator.py`)
```python
def calculate_daily_clip(user_id):
    """
    Core algorithm:
    1. Get current balance
    2. Sum upcoming expenses until next paycheck
    3. Add expected income until next paycheck
    4. Divide by days remaining
    """
    
def test_scenario(user_id, scenario_expense):
    """
    Calculate impact of hypothetical expense
    """
```

**Cash Flow Generator** (`cash_flow.py`)
```python
def generate_timeline(user_id, days=30):
    """
    Create daily cash flow projection
    """
```

## Database Schema (SQLite)

### Minimal Tables
```sql
users (id, email, password_hash, created_at)
accounts (id, user_id, name, current_balance, updated_at)
planned_expenses (id, user_id, name, amount, due_date, is_recurring, created_at)
planned_income (id, user_id, name, amount, expected_date, frequency, created_at)
paycheck_schedules (id, user_id, amount, frequency, next_date, day_of_month)
```

## Development Workflow

### 1. Backend First
- Set up Flask app with basic auth
- Create database models
- Build core calculation engine
- Test daily clip algorithm

### 2. Frontend Core
- React setup with routing
- Authentication flow
- Setup wizard
- Daily clip display

### 3. Planning Features
- Expense entry forms
- Income scheduling
- Basic timeline view

### 4. Enhancement
- Scenario testing
- Better visualizations
- Mobile optimization

## Key Design Decisions

### Why SQLite?
- Simple deployment
- No infrastructure complexity
- Easy to migrate later
- Perfect for MVP scale

### Why Manual Entry?
- Immediate value without bank integrations
- User understands inputs = trusts outputs
- Faster development
- Proves core concept

### Why Minimal Features?
- Focus on core value proposition
- Faster to market
- Easier to test hypothesis
- Clear upgrade path

---

*This structure prioritizes simplicity and speed while maintaining clean architecture for future growth.*