import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSubmit: (transactionData: any) => Promise<void>;
}

// Comprehensive expense categories based on personal-finance-manager
const EXPENSE_CATEGORIES = [
  // Fixed Expenses
  'Housing', 'Rent', 'Mortgage',
  'Insurance', 'Auto Insurance', 'Health Insurance',
  'Phone', 'Internet', 'Cable TV',
  'Subscriptions',
  
  // Variable Expenses  
  'Utilities', 'Electric', 'Gas', 'Water',
  'Groceries', 'Gas & Fuel',
  'Healthcare', 'Medical', 'Pharmacy',
  'Transportation', 'Car Payment', 'Car Maintenance',
  
  // Flexible Expenses
  'Dining', 'Restaurants', 'Coffee', 'Fast Food',
  'Entertainment', 'Movies', 'Streaming', 'Gaming',
  'Shopping', 'Clothing', 'Electronics',
  'Personal Care', 'Beauty', 'Fitness',
  'Education', 'Books', 'Courses',
  'Travel', 'Hotels', 'Flights',
  'Gifts', 'Donations',
  'Home & Garden', 'Repairs', 'Supplies',
  'Other'
];

const INCOME_TYPES = [
  'Salary', 'Wages', 'Overtime',
  'Freelance', 'Contract Work', 'Consulting',
  'Investment', 'Dividends', 'Interest',
  'Bonus', 'Commission', 'Tips',
  'Business Income', 'Rental Income',
  'Government Benefits', 'Tax Refund',
  'Gift', 'Inheritance',
  'Side Income', 'Gig Work',
  'Other Income'
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  open,
  onClose,
  type,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date(),
    recurrence_type: 'none',
    recurrence_interval: 1,
    notes: '',
    is_recurring: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date(),
        recurrence_type: 'none',
        recurrence_interval: 1,
        notes: '',
        is_recurring: false
      });
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Amount must be greater than 0');
        return;
      }
      if (!formData.category) {
        setError('Category is required');
        return;
      }

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date.toISOString().split('T')[0],
        is_income: type === 'income',
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring ? formData.recurrence_type : 'none',
        recurrence_interval: formData.recurrence_interval,
        notes: formData.notes.trim() || null
      };

      await onSubmit(transactionData);
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to add ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const getNextOccurrencePreview = () => {
    if (!formData.is_recurring || formData.recurrence_type === 'none') {
      return null;
    }

    const date = new Date(formData.date);
    const dates = [];
    let currentDate = new Date(date);

    for (let i = 0; i < 3; i++) {
      dates.push(new Date(currentDate));
      
      switch (formData.recurrence_type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + formData.recurrence_interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * formData.recurrence_interval));
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + (14 * formData.recurrence_interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + formData.recurrence_interval);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + (3 * formData.recurrence_interval));
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + formData.recurrence_interval);
          break;
      }
    }

    return `Next 3 occurrences: ${dates.map(d => d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })).join(', ')}`;
  };

  const categories = type === 'income' ? INCOME_TYPES : EXPENSE_CATEGORIES;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={type === 'income' ? 'e.g., Freelance payment' : 'e.g., Coffee at Starbucks'}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{ startAdornment: '$' }}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{type === 'income' ? 'Income Type' : 'Category'}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label={type === 'income' ? 'Income Type' : 'Category'}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newDate) => setFormData({ ...formData, date: newDate || new Date() })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      is_recurring: e.target.checked,
                      recurrence_type: e.target.checked ? 'monthly' : 'none'
                    })}
                    color="primary"
                  />
                }
                label="Make this recurring"
              />
            </Grid>

            {formData.is_recurring && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Recurrence Type</InputLabel>
                    <Select
                      value={formData.recurrence_type}
                      onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value })}
                      label="Recurrence Type"
                    >
                      {RECURRENCE_OPTIONS.filter(option => option.value !== 'none').map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Repeat Every"
                    type="number"
                    value={formData.recurrence_interval}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      recurrence_interval: Math.max(1, parseInt(e.target.value) || 1) 
                    })}
                    inputProps={{ min: 1, max: 12 }}
                    helperText={`Every ${formData.recurrence_interval} ${formData.recurrence_type}${formData.recurrence_interval > 1 ? 's' : ''}`}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#f8f9fa', border: '1px solid #e6ebf1' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Recurrence Preview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getNextOccurrencePreview()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this transaction..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.description || !formData.amount || !formData.category}
            sx={{
              bgcolor: '#635bff',
              '&:hover': { bgcolor: '#5b4ff0' }
            }}
          >
            {loading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTransactionDialog;