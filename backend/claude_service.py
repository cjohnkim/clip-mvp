"""
Claude AI Service for intelligent financial insights and recommendations
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
try:
    import anthropic
except ImportError:
    anthropic = None
from models_simple import Transaction, Account, User, RecurringItem, db

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        """Initialize Claude service"""
        self.api_key = os.environ.get('ANTHROPIC_API_KEY')
        self.client = None
        
        if self.api_key and anthropic:
            try:
                self.client = anthropic.Anthropic(api_key=self.api_key)
                logger.info("Claude service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Claude client: {e}")
                self.client = None
        else:
            if not anthropic:
                logger.warning("Anthropic library not installed - Claude features will be mocked")
            else:
                logger.warning("No Anthropic API key found - Claude features will be mocked")
    
    def is_available(self) -> bool:
        """Check if Claude service is available"""
        return self.client is not None
    
    def categorize_transaction(self, transaction_description: str, amount: float, 
                             merchant_name: Optional[str] = None) -> Dict[str, any]:
        """Use Claude to intelligently categorize a transaction"""
        
        if not self.is_available():
            # Mock response for development
            return self._mock_categorize_transaction(transaction_description, amount)
        
        try:
            prompt = f"""Analyze this financial transaction and provide categorization:

Transaction: {transaction_description}
Amount: ${abs(amount)}
Merchant: {merchant_name or 'Unknown'}
Type: {'Income' if amount > 0 else 'Expense'}

Provide a JSON response with:
1. category: The most appropriate category from this list: [Housing, Transportation, Food, Shopping, Entertainment, Healthcare, Education, Personal Care, Gifts, Travel, Business, Utilities, Insurance, Savings, Investment, Debt Payment, Income, Other]
2. confidence: Your confidence level (0-1)
3. subcategory: A more specific subcategory
4. recurring_likelihood: Likelihood this is a recurring transaction (0-1)
5. essential: Whether this is an essential expense (true/false)
6. note: A brief note about the transaction (max 50 chars)

Respond only with valid JSON."""

            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=300,
                temperature=0,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            logger.error(f"Error categorizing transaction: {e}")
            return self._mock_categorize_transaction(transaction_description, amount)
    
    def analyze_spending_patterns(self, user_id: int, days: int = 30) -> Dict[str, any]:
        """Analyze user's spending patterns and provide insights"""
        
        # Get user's recent transactions
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        transactions = Transaction.query.filter_by(user_id=user_id).filter(
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        if not transactions:
            return {
                "insights": [],
                "warnings": [],
                "opportunities": [],
                "daily_allowance_adjustment": 0
            }
        
        if not self.is_available():
            return self._mock_spending_analysis(transactions)
        
        try:
            # Prepare transaction data for Claude
            transaction_data = []
            for t in transactions:
                transaction_data.append({
                    "date": t.date.isoformat(),
                    "description": t.description,
                    "amount": float(t.amount),
                    "category": t.category,
                    "is_income": t.is_income
                })
            
            # Get user's account balance
            total_balance = sum(float(a.current_balance) for a in Account.query.filter_by(user_id=user_id, is_active=True).all())
            
            prompt = f"""Analyze these spending patterns and provide actionable insights:

Current Balance: ${total_balance}
Transactions (last {days} days):
{json.dumps(transaction_data, indent=2)}

Provide a JSON response with:
1. insights: Array of 2-3 key insights about spending patterns
2. warnings: Array of potential issues to watch (e.g., overspending categories)
3. opportunities: Array of money-saving opportunities
4. daily_allowance_adjustment: Suggested adjustment to daily allowance (-1 to 1 multiplier)
5. top_categories: Top 3 spending categories with amounts
6. unusual_transactions: Any transactions that seem unusual or concerning

Be specific and actionable. Focus on helping the user save money and spend wisely."""

            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing spending patterns: {e}")
            return self._mock_spending_analysis(transactions)
    
    def get_daily_recommendations(self, user_id: int) -> Dict[str, any]:
        """Get personalized daily financial recommendations"""
        
        user = User.query.get(user_id)
        if not user:
            return {"recommendations": [], "daily_tip": ""}
        
        # Get today's transactions
        today = datetime.now().date()
        today_transactions = Transaction.query.filter_by(
            user_id=user_id,
            date=today
        ).all()
        
        # Get recurring transactions
        recurring = RecurringItem.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()
        
        # Calculate current daily allowance
        accounts = Account.query.filter_by(user_id=user_id, is_active=True).all()
        total_balance = sum(float(a.current_balance) for a in accounts)
        
        if not self.is_available():
            return self._mock_daily_recommendations(total_balance, today_transactions)
        
        try:
            prompt = f"""Provide personalized daily financial recommendations:

User: {user.first_name}
Current Balance: ${total_balance}
Today's Spending So Far: ${sum(abs(float(t.amount)) for t in today_transactions if not t.is_income)}
Recurring Expenses: {len(recurring)} active

Based on the user's financial situation, provide:
1. recommendations: Array of 2-3 specific actions for today
2. daily_tip: One personalized tip to save money or improve finances
3. suggested_daily_limit: Recommended spending limit for today
4. focus_category: Category to be mindful of today
5. motivation: Encouraging message about their financial journey

Keep recommendations practical and achievable. Be encouraging but realistic."""

            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            logger.error(f"Error getting daily recommendations: {e}")
            return self._mock_daily_recommendations(total_balance, today_transactions)
    
    def suggest_budget_adjustments(self, user_id: int, category_budgets: Dict[str, float]) -> Dict[str, any]:
        """Suggest budget adjustments based on spending patterns"""
        
        # Get last 3 months of transactions
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=90)
        
        transactions = Transaction.query.filter_by(user_id=user_id).filter(
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.is_income == False
        ).all()
        
        if not self.is_available():
            return self._mock_budget_suggestions(category_budgets)
        
        try:
            # Calculate actual spending by category
            category_spending = {}
            for t in transactions:
                cat = t.category or 'Other'
                category_spending[cat] = category_spending.get(cat, 0) + abs(float(t.amount))
            
            # Average monthly spending by category
            for cat in category_spending:
                category_spending[cat] = category_spending[cat] / 3  # 3 months
            
            prompt = f"""Analyze budget vs actual spending and suggest adjustments:

Current Budgets:
{json.dumps(category_budgets, indent=2)}

Actual Monthly Spending (3-month average):
{json.dumps(category_spending, indent=2)}

Provide budget adjustment recommendations:
1. adjustments: Object with category names as keys and suggested new budget amounts
2. rationale: Brief explanation for each major adjustment
3. savings_potential: Estimated monthly savings if recommendations followed
4. priority_adjustments: Top 3 categories that need immediate attention
5. achievability_score: How realistic these adjustments are (0-1)

Be realistic and consider both over and under-budgeted categories."""

            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=800,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            logger.error(f"Error suggesting budget adjustments: {e}")
            return self._mock_budget_suggestions(category_budgets)
    
    # Mock methods for development/testing
    def _mock_categorize_transaction(self, description: str, amount: float) -> Dict[str, any]:
        """Mock categorization for development"""
        description_lower = description.lower()
        
        # Simple keyword-based categorization
        if any(word in description_lower for word in ['grocery', 'safeway', 'whole foods', 'trader joe']):
            category = 'Food'
            subcategory = 'Groceries'
        elif any(word in description_lower for word in ['gas', 'shell', 'chevron', 'exxon']):
            category = 'Transportation'
            subcategory = 'Gas'
        elif any(word in description_lower for word in ['netflix', 'spotify', 'hulu', 'disney']):
            category = 'Entertainment'
            subcategory = 'Streaming Services'
        elif any(word in description_lower for word in ['rent', 'mortgage']):
            category = 'Housing'
            subcategory = 'Rent/Mortgage'
        else:
            category = 'Other'
            subcategory = 'General'
        
        return {
            "category": category,
            "confidence": 0.8,
            "subcategory": subcategory,
            "recurring_likelihood": 0.3,
            "essential": category in ['Housing', 'Transportation', 'Food'],
            "note": f"Auto-categorized as {category}"
        }
    
    def _mock_spending_analysis(self, transactions: List[Transaction]) -> Dict[str, any]:
        """Mock spending analysis for development"""
        total_spent = sum(abs(float(t.amount)) for t in transactions if not t.is_income)
        total_income = sum(float(t.amount) for t in transactions if t.is_income)
        
        return {
            "insights": [
                f"You spent ${total_spent:.2f} in the last 30 days",
                f"Your income was ${total_income:.2f}",
                "Consider reducing discretionary spending by 10%"
            ],
            "warnings": [
                "Spending exceeds income" if total_spent > total_income else "Spending is within budget"
            ],
            "opportunities": [
                "Cancel unused subscriptions",
                "Cook more meals at home"
            ],
            "daily_allowance_adjustment": -0.1 if total_spent > total_income else 0,
            "top_categories": {
                "Food": total_spent * 0.3,
                "Transportation": total_spent * 0.2,
                "Shopping": total_spent * 0.15
            },
            "unusual_transactions": []
        }
    
    def _mock_daily_recommendations(self, balance: float, today_transactions: List[Transaction]) -> Dict[str, any]:
        """Mock daily recommendations for development"""
        today_spent = sum(abs(float(t.amount)) for t in today_transactions if not t.is_income)
        
        return {
            "recommendations": [
                "Limit dining out to save $10-15 today",
                "Use public transit instead of rideshare",
                "Review and cancel one unused subscription"
            ],
            "daily_tip": "Small daily savings add up to big monthly gains!",
            "suggested_daily_limit": min(50, balance * 0.03),
            "focus_category": "Food",
            "motivation": "You're doing great! Every smart choice counts."
        }
    
    def _mock_budget_suggestions(self, current_budgets: Dict[str, float]) -> Dict[str, any]:
        """Mock budget suggestions for development"""
        adjustments = {}
        for cat, budget in current_budgets.items():
            # Suggest 10% reduction for non-essential categories
            if cat not in ['Housing', 'Transportation', 'Healthcare']:
                adjustments[cat] = budget * 0.9
            else:
                adjustments[cat] = budget
        
        return {
            "adjustments": adjustments,
            "rationale": {
                "Food": "Based on your patterns, you can save $50/month here",
                "Entertainment": "Reducing by 10% is achievable without major lifestyle changes"
            },
            "savings_potential": sum(current_budgets.values()) * 0.1,
            "priority_adjustments": ["Food", "Shopping", "Entertainment"],
            "achievability_score": 0.85
        }