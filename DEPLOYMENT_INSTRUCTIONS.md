# Money Clip v2.0 Athletic Platform - Deployment Instructions

## Step 1: Railway Backend Deployment

### 1.1 Login and Setup
```bash
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp/backend
railway login
```

### 1.2 Initialize Railway Project
```bash
railway init
```
- Choose "Deploy from GitHub repo" 
- Select your `clip-mvp` repository
- Choose the `v2-athletes` branch
- Set root directory to `backend`

### 1.3 Set Environment Variables in Railway Dashboard
Go to your Railway project settings and add:

```bash
# Database Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Security Keys
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key

# Environment
FLASK_ENV=production
```

### 1.4 Deploy
```bash
railway up
```

The deployment will:
- Install dependencies from `requirements.txt`
- Run the Flask app via `gunicorn app:app`
- Execute the release command to create tables and seed achievements
- Deploy to a Railway URL (e.g., `https://clip-api.up.railway.app`)

## Step 2: Vercel Frontend Deployment

### 2.1 Update Environment Variables
Update the Railway URL in `frontend/.env.production`:
```bash
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

### 2.2 Deploy to Vercel
```bash
cd /Users/chulhojkim/CascadeProjects/money-clip-mvp/frontend
npx vercel --prod
```

- Choose "Link to existing project" if you have the marketing site already
- Set the project directory to `frontend`
- Set the output directory to `build`
- Configure custom domain as `app.moneyclip.money`

### 2.3 Alternative: Vercel CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy
vercel --prod
```

## Step 3: Database Setup (Supabase)

### 3.1 SQL Migrations
Run these SQL commands in your Supabase SQL editor:

```sql
-- User Streaks Table
CREATE TABLE user_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_training_days INTEGER DEFAULT 0,
  last_active_date DATE,
  performance_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value FLOAT NOT NULL,
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements Junction Table
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id INTEGER REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  shared_count INTEGER DEFAULT 0
);

-- Daily Performance Table
CREATE TABLE daily_performance (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  performance_score FLOAT NOT NULL,
  daily_target FLOAT NOT NULL,
  actual_spent FLOAT NOT NULL,
  amount_saved FLOAT NOT NULL,
  performance_category VARCHAR(20) NOT NULL,
  streak_contribution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User Levels Table
CREATE TABLE user_levels (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  perfect_sessions INTEGER DEFAULT 0,
  total_savings FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_daily_performance_user_date ON daily_performance(user_id, date);
CREATE INDEX idx_user_levels_user_id ON user_levels(user_id);
```

### 3.2 Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own performance" ON daily_performance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own performance" ON daily_performance FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own levels" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own levels" ON user_levels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own levels" ON user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements table is publicly readable for the achievement list
CREATE POLICY "Achievements are publicly readable" ON achievements FOR SELECT TO anon, authenticated USING (true);
```

## Step 4: Domain Configuration

### 4.1 Add Subdomain in Vercel
1. Go to your Vercel project settings
2. Add custom domain: `app.moneyclip.money`
3. Follow DNS configuration instructions

### 4.2 Update DNS (if needed)
Add CNAME record:
```
app.moneyclip.money → cname.vercel-dns.com
```

## Step 5: Test Deployment

### 5.1 Backend Health Check
Visit: `https://your-railway-app.up.railway.app/api/health`

### 5.2 Frontend Loading
Visit: `https://app.moneyclip.money`

### 5.3 Full Flow Test
1. Register new user
2. Record daily performance
3. Check achievements unlock
4. Verify streak tracking
5. Test analytics dashboard

## Step 6: Monitoring and Logs

### 6.1 Railway Logs
```bash
railway logs
```

### 6.2 Vercel Deployment Logs
Check Vercel dashboard for build/runtime logs

## Environment Variables Summary

### Railway (Backend)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-flask-secret
FLASK_ENV=production
```

### Vercel (Frontend)
```bash
REACT_APP_API_URL=https://your-railway-app.up.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0
GENERATE_SOURCEMAP=false
```

## Expected Results

After successful deployment:
- **Marketing Site**: `moneyclip.money` (existing)
- **Athletic Platform**: `app.moneyclip.money` (new)
- **API**: Railway-hosted Flask backend with athletic gaming features
- **Database**: Supabase with athletic tables and 25+ seeded achievements
- **User Flow**: Seamless signup → onboarding → athletic training experience

The platform will be ready for users to start their financial athletics journey! 🏆