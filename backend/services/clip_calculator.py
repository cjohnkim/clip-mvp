"""
Money Clip MVP - Core Daily Clip Calculator

This is the heart of Money Clip: calculating daily spending capacity
based on current balance, upcoming expenses, and expected income.
"""

from datetime import datetime, timedelta, date
from typing import Dict, List, Optional
from decimal import Decimal


class ClipCalculator:
    """Calculate daily spending capacity (the 'clip')"""
    
    def __init__(self, db_connection=None):
        self.db = db_connection
    
    def calculate_daily_clip(self, user_id: str, mode: str = "next_paycheck") -> Dict:
        """
        Calculate daily spending capacity
        
        Args:
            user_id: User identifier
            mode: "next_paycheck" or "end_of_month"
        
        Returns:
            {
                'daily_clip': float,
                'current_balance': float,
                'days_remaining': int,
                'upcoming_expenses': float,
                'expected_income': float,
                'net_available': float,
                'mode': str,
                'paycheck_date': str,
                'breakdown': dict
            }
        """
        
        # Get user's current financial state
        current_balance = self._get_current_balance(user_id)
        
        # Determine calculation period
        if mode == "next_paycheck":
            end_date = self._get_next_paycheck_date(user_id)
            days_remaining = (end_date - datetime.now().date()).days
        else:  # end_of_month
            today = datetime.now().date()
            if today.month == 12:
                end_date = today.replace(year=today.year + 1, month=1, day=1)
            else:
                end_date = today.replace(month=today.month + 1, day=1)
            days_remaining = (end_date - today).days
        
        # Get upcoming financial events
        upcoming_expenses = self._get_upcoming_expenses(user_id, end_date)
        expected_income = self._get_expected_income(user_id, end_date)
        
        # Calculate net available cash
        net_available = current_balance - upcoming_expenses + expected_income
        
        # Calculate daily clip
        if days_remaining > 0:
            daily_clip = net_available / days_remaining
        else:
            daily_clip = net_available  # Same day calculation
        
        return {
            'daily_clip': round(daily_clip, 2),
            'current_balance': round(current_balance, 2),
            'days_remaining': days_remaining,
            'upcoming_expenses': round(upcoming_expenses, 2),
            'expected_income': round(expected_income, 2),
            'net_available': round(net_available, 2),
            'mode': mode,
            'calculation_date': datetime.now().isoformat(),
            'period_end_date': end_date.isoformat(),
            'breakdown': {
                'expenses': self._get_expense_breakdown(user_id, end_date),
                'income': self._get_income_breakdown(user_id, end_date)
            }
        }
    
    def test_scenario(self, user_id: str, scenario_expense: float, 
                     scenario_date: str = None) -> Dict:
        """
        Test impact of a potential expense
        
        Args:
            user_id: User identifier
            scenario_expense: Amount of hypothetical expense
            scenario_date: When expense would occur (default: today)
        
        Returns:
            {
                'current_clip': float,
                'new_clip': float,
                'impact': float,
                'recommendation': str
            }
        """
        
        # Get current daily clip
        current_calc = self.calculate_daily_clip(user_id)
        current_clip = current_calc['daily_clip']
        
        # Calculate impact
        days_remaining = current_calc['days_remaining']
        if days_remaining > 0:
            impact_per_day = scenario_expense / days_remaining
            new_clip = current_clip - impact_per_day
        else:
            new_clip = current_clip - scenario_expense
            impact_per_day = scenario_expense
        
        # Generate recommendation
        if new_clip >= 20:
            recommendation = "✅ You can comfortably afford this"
        elif new_clip >= 0:
            recommendation = "⚠️ Affordable but will tighten your budget"
        elif new_clip >= -10:
            recommendation = "❌ This would put you slightly over budget"
        else:
            recommendation = "🚨 This would significantly impact your budget"
        
        return {
            'current_clip': round(current_clip, 2),
            'new_clip': round(new_clip, 2),
            'impact': round(impact_per_day, 2),
            'scenario_expense': scenario_expense,
            'recommendation': recommendation,
            'days_affected': days_remaining
        }
    
    def _get_current_balance(self, user_id: str) -> float:
        """Get user's current account balance"""
        if not self.db:
            return 1000.0  # Mock data for testing
        
        try:
            # Import here to avoid circular imports
            from models import Account
            
            # Query database for primary account balance (main account used for daily spending)
            primary_account = self.db.session.query(Account).filter_by(
                user_id=int(user_id),
                is_primary=True
            ).first()
            
            if primary_account:
                print(f"Primary account balance for user {user_id}: {primary_account.current_balance}")
                return float(primary_account.current_balance)
            
            # Fallback: sum all accounts if no primary is set
            total_balance = self.db.session.query(
                self.db.func.sum(Account.current_balance)
            ).filter_by(user_id=int(user_id)).scalar()
            
            print(f"Total balance (no primary) for user {user_id}: {total_balance}")
            return float(total_balance) if total_balance else 0.0
            
        except Exception as e:
            print(f"Error getting current balance: {e}")
            return 1000.0  # Fallback to mock data
    
    def _get_next_paycheck_date(self, user_id: str) -> datetime.date:
        """Get user's next paycheck date"""
        if not self.db:
            # Mock: next Friday
            today = datetime.now().date()
            days_ahead = (4 - today.weekday()) % 7  # Friday = 4
            if days_ahead == 0:  # Today is Friday
                days_ahead = 7
            return today + timedelta(days=days_ahead)
        
        try:
            # Import here to avoid circular imports
            from models import PaycheckSchedule
            
            # Get the earliest active paycheck schedule
            schedule = PaycheckSchedule.query.filter_by(
                user_id=int(user_id), 
                is_active=True
            ).order_by(PaycheckSchedule.next_date.asc()).first()
            
            if schedule:
                return schedule.next_date
            else:
                # Default to 7 days from now if no schedule
                return datetime.now().date() + timedelta(days=7)
                
        except Exception as e:
            print(f"Error getting next paycheck date: {e}")
            return datetime.now().date() + timedelta(days=7)
    
    def _get_upcoming_expenses(self, user_id: str, end_date: datetime.date) -> float:
        """Get total upcoming expenses until end_date"""
        if not self.db:
            return 500.0  # Mock data
        
        try:
            # Import here to avoid circular imports
            from models import PlannedExpense
            
            # Query database for unpaid planned expenses in date range
            total_expenses = self.db.session.query(
                self.db.func.sum(PlannedExpense.amount)
            ).filter(
                PlannedExpense.user_id == int(user_id),
                PlannedExpense.is_paid == False,
                PlannedExpense.due_date >= datetime.now().date(),
                PlannedExpense.due_date <= end_date
            ).scalar()
            
            return float(total_expenses) if total_expenses else 0.0
            
        except Exception as e:
            print(f"Error getting upcoming expenses: {e}")
            return 500.0  # Fallback to mock data
    
    def _get_expected_income(self, user_id: str, end_date: datetime.date) -> float:
        """Get total expected income until end_date"""
        if not self.db:
            return 0.0  # Mock data
        
        try:
            # Import here to avoid circular imports
            from models import PlannedIncome, PaycheckSchedule
            
            total_income = 0.0
            
            # Get planned income (including recurring)
            planned_income_items = PlannedIncome.query.filter(
                PlannedIncome.user_id == int(user_id),
                PlannedIncome.is_received == False,
                PlannedIncome.expected_date >= datetime.now().date(),
                PlannedIncome.expected_date <= end_date
            ).all()
            
            for income in planned_income_items:
                if income.is_recurring and income.recurrence_frequency:
                    # Calculate recurring income occurrences
                    current_date = income.expected_date
                    while current_date <= end_date:
                        if current_date >= datetime.now().date():
                            total_income += float(income.amount)
                        
                        # Calculate next occurrence
                        if income.recurrence_frequency == 'weekly':
                            current_date += timedelta(weeks=1)
                        elif income.recurrence_frequency == 'bi-weekly':
                            current_date += timedelta(weeks=2)
                        elif income.recurrence_frequency == 'monthly':
                            if current_date.month == 12:
                                current_date = current_date.replace(year=current_date.year + 1, month=1)
                            else:
                                current_date = current_date.replace(month=current_date.month + 1)
                        elif income.recurrence_frequency == 'semi-monthly':
                            current_date += timedelta(days=15)
                        elif income.recurrence_frequency == 'quarterly':
                            month = current_date.month + 3
                            year = current_date.year
                            if month > 12:
                                month -= 12
                                year += 1
                            current_date = current_date.replace(year=year, month=month)
                        elif income.recurrence_frequency == 'yearly':
                            current_date = current_date.replace(year=current_date.year + 1)
                        else:
                            break
                else:
                    # One-time income
                    total_income += float(income.amount)
            
            # Get paycheck income
            paycheck_schedules = PaycheckSchedule.query.filter_by(
                user_id=int(user_id),
                is_active=True
            ).all()
            
            for schedule in paycheck_schedules:
                # Count how many paychecks occur between now and end_date
                current_date = schedule.next_date
                while current_date <= end_date:
                    if current_date >= datetime.now().date():
                        total_income += float(schedule.amount)
                    
                    # Calculate next paycheck date based on frequency
                    if schedule.frequency == 'weekly':
                        current_date += timedelta(weeks=1)
                    elif schedule.frequency == 'bi-weekly':
                        current_date += timedelta(weeks=2)
                    elif schedule.frequency == 'monthly':
                        # Add one month (approximate)
                        if current_date.month == 12:
                            current_date = current_date.replace(year=current_date.year + 1, month=1)
                        else:
                            current_date = current_date.replace(month=current_date.month + 1)
                    elif schedule.frequency == 'semi-monthly':
                        # Add 15 days (approximate)
                        current_date += timedelta(days=15)
                    else:
                        # Unknown frequency, break to avoid infinite loop
                        break
            
            return total_income
            
        except Exception as e:
            print(f"Error getting expected income: {e}")
            return 0.0  # Fallback to mock data
    
    def _get_expense_breakdown(self, user_id: str, end_date: datetime.date) -> List[Dict]:
        """Get detailed breakdown of upcoming expenses"""
        if not self.db:
            return [
                {'name': 'Rent', 'amount': 300.0, 'date': '2025-06-15'},
                {'name': 'Groceries', 'amount': 200.0, 'date': '2025-06-18'}
            ]
        
        try:
            # Import here to avoid circular imports
            from models import PlannedExpense
            
            expenses = PlannedExpense.query.filter(
                PlannedExpense.user_id == int(user_id),
                PlannedExpense.is_paid == False,
                PlannedExpense.due_date >= datetime.now().date(),
                PlannedExpense.due_date <= end_date
            ).order_by(PlannedExpense.due_date.asc()).all()
            
            return [
                {
                    'name': expense.name,
                    'amount': float(expense.amount),
                    'date': expense.due_date.isoformat(),
                    'category': expense.category
                }
                for expense in expenses
            ]
            
        except Exception as e:
            print(f"Error getting expense breakdown: {e}")
            return []
    
    def _get_income_breakdown(self, user_id: str, end_date: datetime.date) -> List[Dict]:
        """Get detailed breakdown of expected income"""
        if not self.db:
            return []
        
        try:
            # Import here to avoid circular imports
            from models import PlannedIncome, PaycheckSchedule
            
            income_items = []
            
            # Get planned income
            planned_income = PlannedIncome.query.filter(
                PlannedIncome.user_id == int(user_id),
                PlannedIncome.is_received == False,
                PlannedIncome.expected_date >= datetime.now().date(),
                PlannedIncome.expected_date <= end_date
            ).order_by(PlannedIncome.expected_date.asc()).all()
            
            for income in planned_income:
                if income.is_recurring and income.recurrence_frequency:
                    # Generate recurring income entries
                    current_date = income.expected_date
                    while current_date <= end_date:
                        if current_date >= datetime.now().date():
                            income_items.append({
                                'name': income.name,
                                'amount': float(income.amount),
                                'date': current_date.isoformat(),
                                'source': income.source,
                                'type': 'recurring'
                            })
                        
                        # Calculate next occurrence
                        if income.recurrence_frequency == 'weekly':
                            current_date += timedelta(weeks=1)
                        elif income.recurrence_frequency == 'bi-weekly':
                            current_date += timedelta(weeks=2)
                        elif income.recurrence_frequency == 'monthly':
                            if current_date.month == 12:
                                current_date = current_date.replace(year=current_date.year + 1, month=1)
                            else:
                                current_date = current_date.replace(month=current_date.month + 1)
                        elif income.recurrence_frequency == 'semi-monthly':
                            current_date += timedelta(days=15)
                        elif income.recurrence_frequency == 'quarterly':
                            # Add 3 months
                            month = current_date.month + 3
                            year = current_date.year
                            if month > 12:
                                month -= 12
                                year += 1
                            current_date = current_date.replace(year=year, month=month)
                        elif income.recurrence_frequency == 'yearly':
                            current_date = current_date.replace(year=current_date.year + 1)
                        else:
                            break
                else:
                    # One-time income
                    income_items.append({
                        'name': income.name,
                        'amount': float(income.amount),
                        'date': income.expected_date.isoformat(),
                        'source': income.source,
                        'type': 'planned'
                    })
            
            # Get paycheck income
            paycheck_schedules = PaycheckSchedule.query.filter_by(
                user_id=int(user_id),
                is_active=True
            ).all()
            
            for schedule in paycheck_schedules:
                current_date = schedule.next_date
                while current_date <= end_date:
                    if current_date >= datetime.now().date():
                        income_items.append({
                            'name': schedule.name,
                            'amount': float(schedule.amount),
                            'date': current_date.isoformat(),
                            'source': 'paycheck',
                            'type': 'recurring'
                        })
                    
                    # Calculate next paycheck date
                    if schedule.frequency == 'weekly':
                        current_date += timedelta(weeks=1)
                    elif schedule.frequency == 'bi-weekly':
                        current_date += timedelta(weeks=2)
                    elif schedule.frequency == 'monthly':
                        if current_date.month == 12:
                            current_date = current_date.replace(year=current_date.year + 1, month=1)
                        else:
                            current_date = current_date.replace(month=current_date.month + 1)
                    elif schedule.frequency == 'semi-monthly':
                        current_date += timedelta(days=15)
                    else:
                        break
            
            # Sort by date
            income_items.sort(key=lambda x: x['date'])
            return income_items
            
        except Exception as e:
            print(f"Error getting income breakdown: {e}")
            return []
    
    def generate_cash_flow_timeline(self, user_id: str, start_date: date, days: int = 30) -> List[Dict]:
        """Generate daily cash flow projection"""
        try:
            timeline = []
            current_balance = self._get_current_balance(user_id)
            
            # Get all upcoming expenses and income
            end_date = start_date + timedelta(days=days)
            expenses = self._get_expense_breakdown(user_id, end_date)
            income = self._get_income_breakdown(user_id, end_date)
            
            # Create expense and income lookup by date
            expenses_by_date = {}
            for expense in expenses:
                exp_date = expense['date']
                if exp_date not in expenses_by_date:
                    expenses_by_date[exp_date] = []
                expenses_by_date[exp_date].append(expense)
            
            income_by_date = {}
            for inc in income:
                inc_date = inc['date']
                if inc_date not in income_by_date:
                    income_by_date[inc_date] = []
                income_by_date[inc_date].append(inc)
            
            # Generate daily timeline
            running_balance = current_balance
            
            for i in range(days):
                current_date = start_date + timedelta(days=i)
                date_str = current_date.isoformat()
                
                day_expenses = expenses_by_date.get(date_str, [])
                day_income = income_by_date.get(date_str, [])
                
                day_expense_total = sum(exp['amount'] for exp in day_expenses)
                day_income_total = sum(inc['amount'] for inc in day_income)
                
                # Update running balance
                running_balance = running_balance + day_income_total - day_expense_total
                
                timeline.append({
                    'date': date_str,
                    'balance': round(running_balance, 2),
                    'income': round(day_income_total, 2),
                    'expenses': round(day_expense_total, 2),
                    'net_change': round(day_income_total - day_expense_total, 2),
                    'income_items': day_income,
                    'expense_items': day_expenses
                })
            
            return timeline
            
        except Exception as e:
            print(f"Error generating cash flow timeline: {e}")
            return []


# Example usage and testing
if __name__ == "__main__":
    calculator = ClipCalculator()
    
    # Test daily clip calculation
    result = calculator.calculate_daily_clip("test_user")
    print("Daily Clip Calculation:")
    print(f"Daily Clip: ${result['daily_clip']}")
    print(f"Current Balance: ${result['current_balance']}")
    print(f"Days Remaining: {result['days_remaining']}")
    print(f"Net Available: ${result['net_available']}")
    
    print("\n" + "="*50 + "\n")
    
    # Test scenario
    scenario = calculator.test_scenario("test_user", 150.0)
    print("Scenario Test ($150 expense):")
    print(f"Current Clip: ${scenario['current_clip']}")
    print(f"New Clip: ${scenario['new_clip']}")
    print(f"Impact: -${scenario['impact']}/day")
    print(f"Recommendation: {scenario['recommendation']}")