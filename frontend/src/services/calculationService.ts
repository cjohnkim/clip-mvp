import apiClient from './authService';

export const calculationService = {
  // Get daily clip calculation
  getDailyClip: async (mode: string = 'end_of_month', forceRefresh: boolean = false) => {
    let url = `/api/calculation/daily-clip?mode=${mode}`;
    if (forceRefresh) {
      url += `&_t=${Date.now()}`;
    }
    const response = await apiClient.get(url);
    return response;
  },

  // Test spending scenario
  testScenario: async (expenseAmount: number, scenarioDate?: string) => {
    const response = await apiClient.post('/api/calculation/scenario', {
      expense_amount: expenseAmount,
      scenario_date: scenarioDate,
    });
    return response;
  },

  // Get cash flow timeline
  getCashFlow: async (days: number = 30, startDate?: string) => {
    let url = `/api/calculation/cash-flow?days=${days}`;
    if (startDate) {
      url += `&start_date=${startDate}`;
    }
    const response = await apiClient.get(url);
    return response;
  },

  // Get financial summary
  getSummary: async () => {
    const response = await apiClient.get('/api/calculation/summary');
    return response;
  },

  // Refresh calculations
  refresh: async () => {
    const response = await apiClient.post('/api/calculation/refresh');
    return response;
  },

  // Update primary account balance
  updatePrimaryAccountBalance: async (balance: number) => {
    const response = await apiClient.put('/api/planning/accounts/primary/balance', {
      current_balance: balance,
    });
    return response;
  },
};