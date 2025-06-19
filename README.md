# Clip - Financial Training Platform

> Train like a financial athlete. Turn daily spending into performance wins.

## Overview

Clip is a financial training platform that transforms money management from restrictive budgeting into performance-based wealth building. Using the Financial Athletes methodology, users track daily spending power, build saving streaks, and visualize financial momentum like athletic training.

## Core Value Proposition

Clip answers one critical question: **"What can I spend today?"** - but makes it feel like training for financial success.

Instead of guilt-based budgeting, Clip calculates your daily spending capacity and turns smart financial choices into performance wins based on:
- Your current balance
- Upcoming expenses (bills, plans, goals) 
- Expected income timing
- Days until next financial milestone

## Key Features

### 🏃‍♂️ **Financial Athletes Training**
- ✅ **Daily Spending Power**: Clear daily targets based on your financial timeline
- ✅ **Performance Tracking**: Visual progress with momentum-based scaling 
- ✅ **Streak Building**: Turn consistent saving into a performance game
- ✅ **Momentum Visualization**: See financial progress like athletic achievement

### 📊 **Smart Financial Planning** 
- ✅ **Timeline View**: Proportional spacing showing real financial momentum
- ✅ **Scenario Testing**: Model financial decisions before making them
- ✅ **Expense Templates**: Smart recurring expense detection and planning
- ✅ **Income Forecasting**: Plan and track multiple income streams
- ✅ **Recurrence Options**: Monthly bills, weekly expenses with smart date suggestions

### 🎯 **Transparent Calculations**
- ✅ **Balance Breakdown**: Full transparency into daily spending power calculation
- ✅ **Cash Flow Modeling**: 30-day financial projection with event visualization
- ✅ **Performance Insights**: Track what's working and optimize accordingly
- ✅ **Income/Expense Events**: See all financial activities in timeline

### 💪 **Performance-Based UX**
- ✅ **Visual Scaling**: Cards scale based on financial performance (0.95x - 1.05x)
- ✅ **Momentum Colors**: Green for excellent performance, red for poor performance
- ✅ **Savings Visualization**: Upward charts show dollars saved forward
- ✅ **Athletic Messaging**: "Crushing it! Level up with strategic saves 🚀"

## Core User Flow

1. **Setup (2 minutes):**
   - Enter current account balance
   - Add paycheck schedule
   - Choose expense templates (rent, utilities, etc.)
   
2. **Plan (ongoing):**
   - Add upcoming expenses with smart recurrence options
   - Set dates with intelligent suggestions (first of month for monthly bills)
   - Track income streams with visual previews
   
3. **Train like a financial athlete:**
   - Check daily spending power: "I can spend $47 today"
   - See detailed calculation breakdown on demand
   - Test scenarios: "If I buy this $200 item, my daily clip becomes $15"
   - Track performance and build saving streaks

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for consistent design system
- **React Router** for navigation
- **Recharts** for financial visualizations
- **Axios** for API communication

### Backend  
- **Flask** Python web framework
- **SQLAlchemy** ORM with SQLite database
- **JWT Authentication** for secure user sessions
- **RESTful API** design with comprehensive endpoints

### Design System
- **Mint Green Theme** (`#00d4aa`) for consistent branding
- **Inter Font Family** for clean, modern typography
- **Performance-Based Visual Scaling** for UI feedback
- **Mobile-Responsive** design throughout

## Project Structure

```
money-clip-mvp/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Login, Signup, Authentication
│   │   │   ├── dashboard/   # Main dashboard with Daily Spending Power
│   │   │   ├── timeline/    # Financial momentum visualization
│   │   │   ├── planning/    # Expense/income planning tools
│   │   │   ├── scenario/    # Financial scenario testing
│   │   │   └── setup/       # Account setup flow
│   │   ├── contexts/        # React Context for state management
│   │   ├── services/        # API service layers
│   │   └── App.tsx         # Main application component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Flask Python API
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── models.py           # Database models
│   ├── app.py              # Flask application setup
│   └── requirements.txt    # Python dependencies
└── README.md               # This file
```

## Financial Athletes Methodology

### Core Principles
1. **Performance Over Punishment**: Focus on what you can achieve, not restrictions
2. **Daily Practice**: Consistent daily actions build financial strength
3. **Visual Progress**: Every dollar saved should feel like a victory
4. **Momentum Building**: Small wins compound into major financial achievements

### Success Stories
- **Emergency Fund Building**: $15K saved in 10 months through $47/day targets
- **House Down Payment**: $40K saved 8 months early through visual progress tracking  
- **Debt Elimination**: $8K credit card debt paid off through consistent daily targets
- **Investment Growth**: Travel fund + portfolio growth through clear spending boundaries

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login with JWT token
- `GET /api/auth/profile` - Get current user profile

### Financial Planning
- `GET /api/calculation/daily-clip` - Calculate daily spending power
- `GET /api/calculation/cash-flow` - Get 30-day cash flow projection
- `POST /api/calculation/scenario` - Test financial scenarios

### Expense & Income Management
- `GET/POST /api/planning/expenses` - Manage planned expenses with recurrence
- `GET/POST /api/planning/income` - Manage expected income streams
- `PUT /api/planning/accounts/primary/balance` - Update account balance

## Getting Started

### Prerequisites
- Node.js 18+ for frontend development
- Python 3.8+ for backend development  
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/money-clip-mvp.git
   cd money-clip-mvp
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs on `http://localhost:3002`

3. **Set up the backend** 
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```
   Backend API runs on `http://localhost:8000`

### Development Workflow

1. **Start both servers**:
   - Frontend: `cd frontend && npm start`
   - Backend: `cd backend && python run.py`

2. **Make changes and test**

3. **Commit your updates**:
   ```bash
   git add .
   git commit -m "Your update description"
   git push
   ```

## Development Principles

1. **Performance First** - Every feature should make saving feel like winning
2. **Visual Progress** - Make financial improvements immediately visible
3. **Athletic Mindset** - Use training and performance metaphors throughout
4. **Transparency** - Users should understand how every calculation works

## Success Metrics

- **Time to first daily clip**: < 2 minutes
- **Daily engagement**: Users check their spending power regularly
- **Planning behavior**: Users add expenses and track income
- **Performance wins**: Users celebrate saving streaks and momentum
- **Confidence**: Users feel like financial athletes in training

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Team

Built by John Kim and Jarred Ward, former Simple alumni who believe financial tools should make you feel capable, not confused.

---

**Train like a financial athlete. Start your transformation today.** 🏃‍♂️💪

*This platform proves the core hypothesis: Performance-based financial training provides more value than restrictive budgeting.*