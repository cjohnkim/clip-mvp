import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { planningService } from '../../services/planningService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function generateRecurrencePreview(form: any, dateField: string): string[] {
  const dates: string[] = [];
  const dateValue = form[dateField];
  if (!dateValue || !form.recurrence_frequency) return dates;
  
  let currentDate = new Date(dateValue);
  
  for (let i = 0; i < 3; i++) {
    dates.push(currentDate.toISOString().split('T')[0]);
    
    // Calculate next occurrence
    switch (form.recurrence_frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'bi-weekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'semi-monthly':
        currentDate.setDate(currentDate.getDate() + 15);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        break;
    }
  }
  
  return dates;
}

function generateIncomePreview(form: any): string[] {
  return generateRecurrencePreview(form, 'expected_date');
}

function generateExpensePreview(form: any): string[] {
  return generateRecurrencePreview(form, 'due_date');
}

export default function Planning() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL parameters to set initial tab
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'income' ? 1 : 0;
  };
  
  const [tabValue, setTabValue] = useState(getInitialTab());
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingIncome, setEditingIncome] = useState<any>(null);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: '',
    is_recurring: false,
    recurrence_frequency: '',
  });

  const [incomeForm, setIncomeForm] = useState({
    name: '',
    amount: '',
    expected_date: '',
    source: '',
    is_recurring: false,
    recurrence_frequency: '',
  });

  // Ref for the amount field to focus after template selection
  const amountFieldRef = React.useRef<HTMLInputElement>(null);
  

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesRes, incomeRes] = await Promise.all([
        planningService.getExpenses(),
        planningService.getIncome(),
      ]);
      setExpenses(expensesRes.data.expenses);
      setIncome(incomeRes.data.income);
    } catch (err: any) {
      setError('Failed to load planning data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getSmartDate = (frequency: string | null) => {
    const today = new Date();
    
    if (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'yearly') {
      // For monthly and longer frequencies, suggest first of next month
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return nextMonth.toISOString().split('T')[0];
    } else if (frequency === 'weekly' || frequency === 'bi-weekly') {
      // For weekly frequencies, suggest next week
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    } else {
      // For one-time expenses, suggest today
      return getTodayDate();
    }
  };

  // Expense handlers
  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      name: '',
      amount: '',
      due_date: getTodayDate(),
      category: '',
      is_recurring: false,
      recurrence_frequency: '',
    });
    setExpenseDialogOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseForm({
      name: expense.name,
      amount: expense.amount.toString(),
      due_date: expense.due_date,
      category: expense.category || '',
      is_recurring: expense.is_recurring,
      recurrence_frequency: expense.recurrence_frequency || '',
    });
    setExpenseDialogOpen(true);
  };

  const handleSaveExpense = async () => {
    try {
      const data = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      };

      if (editingExpense) {
        await planningService.updateExpense(editingExpense.id, data);
      } else {
        await planningService.createExpense(data);
      }

      setExpenseDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError('Failed to save expense');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await planningService.deleteExpense(expenseId);
      loadData();
    } catch (err: any) {
      setError('Failed to delete expense');
    }
  };

  // Income handlers
  const handleAddIncome = () => {
    setEditingIncome(null);
    setIncomeForm({
      name: '',
      amount: '',
      expected_date: getTodayDate(),
      source: '',
      is_recurring: false,
      recurrence_frequency: '',
    });
    setIncomeDialogOpen(true);
  };

  const handleEditIncome = (incomeItem: any) => {
    setEditingIncome(incomeItem);
    setIncomeForm({
      name: incomeItem.name,
      amount: incomeItem.amount.toString(),
      expected_date: incomeItem.expected_date,
      source: incomeItem.source || '',
      is_recurring: incomeItem.is_recurring,
      recurrence_frequency: incomeItem.recurrence_frequency || '',
    });
    setIncomeDialogOpen(true);
  };

  const handleSaveIncome = async () => {
    try {
      const data = {
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
      };

      if (editingIncome) {
        await planningService.updateIncome(editingIncome.id, data);
      } else {
        await planningService.createIncome(data);
      }

      setIncomeDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError('Failed to save income');
    }
  };

  const handleDeleteIncome = async (incomeId: number) => {
    try {
      await planningService.deleteIncome(incomeId);
      loadData();
    } catch (err: any) {
      setError('Failed to delete income');
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'white',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              cursor: 'pointer',
              color: '#00d4aa',
              fontWeight: 600,
              fontSize: '1.25rem',
              fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
              mr: 2,
              flexGrow: 1,
            }}
            onClick={() => navigate('/dashboard')}
          >
            Clip
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Expenses" />
            <Tab label="Income" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Spending Tracker</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddExpense}
              >
                Track Spending
              </Button>
            </Box>

            <List>
              {expenses.map((expense: any) => (
                <ListItem key={expense.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {expense.name}
                        {expense.is_recurring && (
                          <Chip size="small" label="Recurring" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {formatCurrency(expense.amount)} • Due: {formatDate(expense.due_date)}
                        {expense.category && ` • ${expense.category}`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditExpense(expense)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteExpense(expense.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {expenses.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No spending tracked"
                    secondary="Track your planned moves to optimize daily spending power"
                  />
                </ListItem>
              )}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Income Streams</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddIncome}
              >
                Boost Income
              </Button>
            </Box>

            <List>
              {income.map((incomeItem: any) => (
                <ListItem key={incomeItem.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {incomeItem.name}
                        {incomeItem.is_recurring && (
                          <Chip size="small" label="Recurring" color="success" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {formatCurrency(incomeItem.amount)} • Expected: {formatDate(incomeItem.expected_date)}
                        {incomeItem.source && ` • ${incomeItem.source}`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditIncome(incomeItem)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteIncome(incomeItem.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {income.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No income streams added"
                    secondary="Add income sources to boost your financial power"
                  />
                </ListItem>
              )}
            </List>
          </TabPanel>
        </Paper>

        {/* Expense Dialog */}
        <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveExpense(); }}>
            <DialogContent>
            {!editingExpense && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Templates
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { name: 'Rent', amount: 0, category: 'Housing', isRecurring: true, frequency: 'monthly' },
                    { name: 'Utilities', amount: 0, category: 'Bills', isRecurring: true, frequency: 'monthly' },
                    { name: 'Groceries', amount: 0, category: 'Food', isRecurring: false, frequency: null },
                    { name: 'Gas', amount: 0, category: 'Transportation', isRecurring: false, frequency: null },
                    { name: 'Phone Bill', amount: 0, category: 'Bills', isRecurring: true, frequency: 'monthly' },
                    { name: 'Internet', amount: 0, category: 'Bills', isRecurring: true, frequency: 'monthly' },
                    { name: 'Car Payment', amount: 0, category: 'Transportation', isRecurring: true, frequency: 'monthly' },
                    { name: 'Insurance', amount: 0, category: 'Bills', isRecurring: true, frequency: 'monthly' },
                    { name: 'Credit Card Payment', amount: 0, category: 'Debt', isRecurring: true, frequency: 'monthly' },
                    { name: 'Dining Out', amount: 0, category: 'Food', isRecurring: false, frequency: null },
                    { name: 'Entertainment', amount: 0, category: 'Leisure', isRecurring: false, frequency: null },
                    { name: 'Medical', amount: 0, category: 'Healthcare', isRecurring: false, frequency: null },
                  ].map((template) => (
                    <Grid item xs={6} sm={4} key={template.name}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.50' }
                        }}
                        onClick={() => {
                          setExpenseForm({
                            name: template.name,
                            amount: template.amount.toString(),
                            due_date: getSmartDate(template.frequency),
                            category: template.category,
                            is_recurring: template.isRecurring,
                            recurrence_frequency: template.frequency || '',
                          });
                          // Focus the amount field after template selection
                          setTimeout(() => {
                            amountFieldRef.current?.focus();
                          }, 100);
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.category} {template.isRecurring && '• Monthly'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Custom Expense
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Expense Name"
              value={expenseForm.name}
              onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
              margin="normal"
              onFocus={(e) => e.target.select()}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              margin="normal"
              inputRef={amountFieldRef}
              inputProps={{
                step: "0.01",
                min: "0"
              }}
              onFocus={(e) => e.target.select()}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={expenseForm.due_date}
              onChange={(e) => setExpenseForm({ ...expenseForm, due_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Category (Optional)"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              margin="normal"
              onFocus={(e) => e.target.select()}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={expenseForm.is_recurring}
                  onChange={(e) => setExpenseForm({ 
                    ...expenseForm, 
                    is_recurring: e.target.checked,
                    recurrence_frequency: e.target.checked ? 'monthly' : '',
                    due_date: e.target.checked ? getSmartDate('monthly') : getTodayDate()
                  })}
                />
              }
              label="This is a recurring expense"
              sx={{ mt: 2 }}
            />
            
            {expenseForm.is_recurring && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={expenseForm.recurrence_frequency}
                  label="Frequency"
                  onChange={(e) => setExpenseForm({ 
                    ...expenseForm, 
                    recurrence_frequency: e.target.value,
                    due_date: getSmartDate(e.target.value)
                  })}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi-weekly">Bi-weekly (every 2 weeks)</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {expenseForm.is_recurring && expenseForm.recurrence_frequency && expenseForm.amount && expenseForm.due_date && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📅 Preview: Next 3 occurrences
                </Typography>
                {generateExpensePreview(expenseForm).map((preview: string, index: number) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {formatCurrency(parseFloat(expenseForm.amount))} on {formatDate(preview)}
                  </Typography>
                ))}
              </Box>
            )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingExpense ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Income Dialog */}
        <Dialog open={incomeDialogOpen} onClose={() => setIncomeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingIncome ? 'Edit Income' : 'Add Income'}
          </DialogTitle>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveIncome(); }}>
            <DialogContent>
            <TextField
              fullWidth
              label="Income Name"
              value={incomeForm.name}
              onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
              margin="normal"
              onFocus={(e) => e.target.select()}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
              margin="normal"
              onFocus={(e) => e.target.select()}
            />
            <TextField
              fullWidth
              label="Expected Date"
              type="date"
              value={incomeForm.expected_date}
              onChange={(e) => setIncomeForm({ ...incomeForm, expected_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Source (Optional)"
              value={incomeForm.source}
              onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
              margin="normal"
              onFocus={(e) => e.target.select()}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={incomeForm.is_recurring}
                  onChange={(e) => setIncomeForm({ 
                    ...incomeForm, 
                    is_recurring: e.target.checked,
                    recurrence_frequency: e.target.checked ? 'monthly' : ''
                  })}
                />
              }
              label="This is recurring income"
              sx={{ mt: 2 }}
            />
            
            {incomeForm.is_recurring && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={incomeForm.recurrence_frequency}
                  label="Frequency"
                  onChange={(e) => setIncomeForm({ ...incomeForm, recurrence_frequency: e.target.value })}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi-weekly">Bi-weekly (every 2 weeks)</MenuItem>
                  <MenuItem value="semi-monthly">Semi-monthly (twice a month)</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {incomeForm.is_recurring && incomeForm.recurrence_frequency && incomeForm.amount && incomeForm.expected_date && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📅 Preview: Next 3 occurrences
                </Typography>
                {generateIncomePreview(incomeForm).map((preview: string, index: number) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {formatCurrency(parseFloat(incomeForm.amount))} on {formatDate(preview)}
                  </Typography>
                ))}
              </Box>
            )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIncomeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingIncome ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
}