"""
Safe-to-Spend Calculator
Replicates Simple.com's Safe-to-Spend feature
"""

from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Dict, List, Optional
from sqlalchemy import and_, func
from models import db, Account, Transaction, SavingsGoal, SafeToSpend, ExpenseCategory, Budget
import logging

logger = logging.getLogger(__name__)

class SafeToSpendCalculator:
    """
    Calculates Safe-to-Spend amount like Simple.com:
    Total Balance - Goals Allocation - Upcoming Bills (next 30 days) = Safe to Spend
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.calculation_date = date.today()
    
    def calculate_total_balance(self) -> Decimal:
        """Calculate total available balance across all accounts"""
        accounts = Account.query.filter_by(user_id=self.user_id, is_active=True).all()
        
        total_balance = Decimal('0.00')
        checking_balance = Decimal('0.00')
        savings_balance = Decimal('0.00')
        credit_available = Decimal('0.00')
        
        for account in accounts:
            if account.account_type.lower() in ['checking', 'depository']:
                checking_balance += account.current_balance
                total_balance += account.current_balance
            elif account.account_type.lower() in ['savings']:
                savings_balance += account.current_balance
                total_balance += account.current_balance
            elif account.account_type.lower() in ['credit']:
                # For credit accounts, available balance is what we can spend
                if account.available_balance:
                    credit_available += account.available_balance
                    total_balance += account.available_balance
        
        return total_balance, checking_balance, savings_balance, credit_available
    
    def calculate_goals_allocation(self) -> Decimal:
        """Calculate total amount allocated to all active goals"""
        goals = SavingsGoal.query.filter_by(
            user_id=self.user_id, 
            is_active=True
        ).all()
        
        total_allocated = Decimal('0.00')
        
        for goal in goals:
            if not goal.is_paused and goal.current_amount < goal.target_amount:
                total_allocated += goal.current_amount
        
        return total_allocated
    
    def calculate_upcoming_bills(self, days_ahead: int = 30) -> Decimal:
        """
        Calculate upcoming scheduled bills/expenses in next N days
        This includes fixed expenses and scheduled payments
        """
        end_date = self.calculation_date + timedelta(days=days_ahead)
        
        # Get fixed monthly expenses (rent, utilities, etc.)
        fixed_categories = ExpenseCategory.query.filter_by(
            user_id=self.user_id,
            expense_type='fixed'
        ).all()
        
        upcoming_bills = Decimal('0.00')
        
        # Sum up monthly budgets for fixed expenses
        for category in fixed_categories:
            if category.monthly_budget > 0:
                # Prorate based on days remaining in month
                days_in_month = 30  # Simplified
                daily_amount = category.monthly_budget / days_in_month
                upcoming_bills += daily_amount * days_ahead
        
        # Add any scheduled future transactions (if we had them)
        # This would integrate with a bills/scheduled payments system
        
        return upcoming_bills
    
    def calculate_daily_goal_allocations(self) -> Decimal:
        """Calculate total daily allocations for all goals"""
        goals = SavingsGoal.query.filter_by(
            user_id=self.user_id,
            is_active=True,
            auto_allocate=True
        ).filter(SavingsGoal.is_paused == False).all()
        
        total_daily = Decimal('0.00')
        
        for goal in goals:
            if goal.current_amount < goal.target_amount:
                if goal.allocation_frequency == 'daily':
                    total_daily += goal.daily_allocation
                elif goal.allocation_frequency == 'weekly':
                    total_daily += goal.daily_allocation / 7
                elif goal.allocation_frequency == 'monthly':
                    total_daily += goal.daily_allocation / 30
        
        return total_daily
    
    def calculate_safe_to_spend(self) -> Dict:
        """
        Main calculation method - returns comprehensive Safe-to-Spend breakdown
        """
        try:
            # Get balance components
            total_balance, checking, savings, credit = self.calculate_total_balance()
            
            # Calculate allocations and bills
            goals_allocation = self.calculate_goals_allocation()
            upcoming_bills = self.calculate_upcoming_bills()
            daily_goals = self.calculate_daily_goal_allocations()
            
            # Calculate Safe-to-Spend
            # Total Balance - Goals Already Allocated - Upcoming Bills = Safe to Spend
            safe_amount = total_balance - goals_allocation - upcoming_bills
            safe_to_spend = max(Decimal('0.00'), safe_amount)  # Never negative
            
            result = {
                'total_balance': float(total_balance),
                'checking_balance': float(checking),
                'savings_balance': float(savings),
                'credit_available': float(credit),
                'allocated_to_goals': float(goals_allocation),
                'upcoming_bills': float(upcoming_bills),
                'daily_goal_allocations': float(daily_goals),
                'safe_to_spend_amount': float(safe_to_spend),
                'calculation_date': self.calculation_date.isoformat(),
                'last_updated': datetime.utcnow().isoformat()
            }
            
            # Cache the calculation
            self._save_calculation(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating Safe-to-Spend for user {self.user_id}: {str(e)}")
            raise
    
    def _save_calculation(self, result: Dict):
        """Save calculation to database for caching"""
        try:
            # Remove existing calculation for today
            existing = SafeToSpend.query.filter_by(
                user_id=self.user_id,
                calculation_date=self.calculation_date
            ).first()
            
            if existing:
                # Update existing
                existing.total_balance = Decimal(str(result['total_balance']))
                existing.allocated_to_goals = Decimal(str(result['allocated_to_goals']))
                existing.upcoming_bills = Decimal(str(result['upcoming_bills']))
                existing.safe_to_spend_amount = Decimal(str(result['safe_to_spend_amount']))
                existing.checking_balance = Decimal(str(result['checking_balance']))
                existing.savings_balance = Decimal(str(result['savings_balance']))
                existing.credit_available = Decimal(str(result['credit_available']))
                existing.last_updated = datetime.utcnow()
            else:
                # Create new
                new_calculation = SafeToSpend(
                    user_id=self.user_id,
                    total_balance=Decimal(str(result['total_balance'])),
                    allocated_to_goals=Decimal(str(result['allocated_to_goals'])),
                    upcoming_bills=Decimal(str(result['upcoming_bills'])),
                    safe_to_spend_amount=Decimal(str(result['safe_to_spend_amount'])),
                    calculation_date=self.calculation_date,
                    checking_balance=Decimal(str(result['checking_balance'])),
                    savings_balance=Decimal(str(result['savings_balance'])),
                    credit_available=Decimal(str(result['credit_available']))
                )
                db.session.add(new_calculation)
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Error saving Safe-to-Spend calculation: {str(e)}")
            db.session.rollback()
    
    def get_cached_calculation(self, max_age_hours: int = 1) -> Optional[Dict]:
        """Get cached Safe-to-Spend calculation if recent enough"""
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        cached = SafeToSpend.query.filter(
            and_(
                SafeToSpend.user_id == self.user_id,
                SafeToSpend.calculation_date == self.calculation_date,
                SafeToSpend.last_updated >= cutoff_time
            )
        ).first()
        
        if cached:
            return cached.to_dict()
        
        return None
    
    def get_or_calculate(self, force_refresh: bool = False) -> Dict:
        """Get cached calculation or calculate new one"""
        if not force_refresh:
            cached = self.get_cached_calculation()
            if cached:
                return cached
        
        return self.calculate_safe_to_spend()

class GoalAllocationEngine:
    """
    Handles automatic daily allocation to goals (Simple.com style)
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    def process_daily_allocations(self) -> Dict:
        """
        Process daily allocations for all active goals
        This would typically run as a daily cron job
        """
        from models import GoalContribution
        
        today = date.today()
        results = {
            'processed_goals': 0,
            'total_allocated': 0.0,
            'errors': []
        }
        
        try:
            # Get all goals that need daily allocation
            goals = SavingsGoal.query.filter_by(
                user_id=self.user_id,
                is_active=True,
                auto_allocate=True
            ).filter(SavingsGoal.is_paused == False).all()
            
            safe_to_spend_calc = SafeToSpendCalculator(self.user_id)
            safe_to_spend_data = safe_to_spend_calc.get_or_calculate()
            available_amount = Decimal(str(safe_to_spend_data['safe_to_spend_amount']))
            
            total_needed = Decimal('0.00')
            
            # Calculate total daily allocation needed
            for goal in goals:
                if goal.current_amount < goal.target_amount:
                    # Recalculate daily allocation based on current progress
                    daily_needed = goal.calculate_daily_allocation()
                    goal.daily_allocation = daily_needed
                    total_needed += Decimal(str(daily_needed))
            
            # Check if we have enough Safe-to-Spend for all allocations
            if total_needed > available_amount:
                # Proportionally reduce allocations to fit available amount
                if total_needed > 0:
                    reduction_factor = available_amount / total_needed
                else:
                    reduction_factor = Decimal('0.00')
            else:
                reduction_factor = Decimal('1.00')
            
            # Process allocations
            for goal in goals:
                if goal.current_amount >= goal.target_amount:
                    continue  # Goal completed
                
                # Calculate allocation amount for today
                base_allocation = Decimal(str(goal.daily_allocation))
                actual_allocation = base_allocation * reduction_factor
                
                if actual_allocation > Decimal('0.01'):  # Only allocate if > 1 cent
                    # Create contribution record
                    contribution = GoalContribution(
                        goal_id=goal.id,
                        user_id=self.user_id,
                        amount=actual_allocation,
                        contribution_type='auto_daily',
                        contribution_date=today,
                        is_automatic=True,
                        allocation_reason='daily_auto',
                        notes=f"Automatic daily allocation (factor: {reduction_factor:.4f})"
                    )
                    
                    # Update goal current amount
                    goal.current_amount += actual_allocation
                    
                    # Mark as completed if target reached
                    if goal.current_amount >= goal.target_amount:
                        goal.completed_at = datetime.utcnow()
                        goal.is_active = False  # Or keep active for over-saving
                    
                    db.session.add(contribution)
                    results['processed_goals'] += 1
                    results['total_allocated'] += float(actual_allocation)
            
            db.session.commit()
            
            # Recalculate Safe-to-Spend after allocations
            safe_to_spend_calc.calculate_safe_to_spend()
            
        except Exception as e:
            logger.error(f"Error processing daily allocations for user {self.user_id}: {str(e)}")
            results['errors'].append(str(e))
            db.session.rollback()
        
        return results

def calculate_user_safe_to_spend(user_id: str, force_refresh: bool = False) -> Dict:
    """Convenience function to calculate Safe-to-Spend for a user"""
    calculator = SafeToSpendCalculator(user_id)
    return calculator.get_or_calculate(force_refresh=force_refresh)

def process_all_user_allocations(user_id: str) -> Dict:
    """Convenience function to process daily allocations for a user"""
    engine = GoalAllocationEngine(user_id)
    return engine.process_daily_allocations()