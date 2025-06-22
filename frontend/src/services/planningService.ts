import apiClient from './authService';

export const planningService = {
  // Account management
  getAccounts: async () => {
    const response = await apiClient.get('/api/planning/accounts');
    return response;
  },

  createAccount: async (accountData: any) => {
    const response = await apiClient.post('/api/planning/accounts', accountData);
    return response;
  },

  updateAccount: async (accountId: number, accountData: any) => {
    const response = await apiClient.put(`/planning/accounts/${accountId}`, accountData);
    return response;
  },

  // Expense management
  getExpenses: async (params?: any) => {
    let url = '/api/planning/expenses';
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    const response = await apiClient.get(url);
    return response;
  },

  createExpense: async (expenseData: any) => {
    const response = await apiClient.post('/api/planning/expenses', expenseData);
    return response;
  },

  updateExpense: async (expenseId: number, expenseData: any) => {
    const response = await apiClient.put(`/planning/expenses/${expenseId}`, expenseData);
    return response;
  },

  deleteExpense: async (expenseId: number) => {
    const response = await apiClient.delete(`/planning/expenses/${expenseId}`);
    return response;
  },

  // Income management
  getIncome: async (params?: any) => {
    let url = '/api/planning/income';
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    const response = await apiClient.get(url);
    return response;
  },

  createIncome: async (incomeData: any) => {
    const response = await apiClient.post('/api/planning/income', incomeData);
    return response;
  },

  updateIncome: async (incomeId: number, incomeData: any) => {
    const response = await apiClient.put(`/planning/income/${incomeId}`, incomeData);
    return response;
  },

  deleteIncome: async (incomeId: number) => {
    const response = await apiClient.delete(`/planning/income/${incomeId}`);
    return response;
  },

  // Paycheck schedule management
  getPaycheckSchedule: async () => {
    const response = await apiClient.get('/api/planning/paycheck-schedule');
    return response;
  },

  createPaycheckSchedule: async (scheduleData: any) => {
    const response = await apiClient.post('/api/planning/paycheck-schedule', scheduleData);
    return response;
  },

  updatePaycheckSchedule: async (scheduleId: number, scheduleData: any) => {
    const response = await apiClient.put(`/planning/paycheck-schedule/${scheduleId}`, scheduleData);
    return response;
  },
};