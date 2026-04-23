import axios from 'axios';

const api = axios.create({
  baseURL: 'https://budget-app-backend-alpha.vercel.app',
});

export const userId = "georges";
export const getAutoMonth = () => new Date().toISOString().slice(0, 7);

export const getDashboard = async (month: string) => {
  const response = await api.get(`/dashboard?month=${month}`);
  return response.data;
};

// --- Monthly Budget ---

export const getMonthlyBudget = async (month: string) => {
  const response = await api.get(`/monthly-budget?month=${month}`);
  return response.data;
};

export const generateMonthlyBudget = async (month: string) => {
  const response = await api.post('/monthly-budget/generate', { userId, month });
  return response.data;
};

export const ensureMonthlyBudget = async (month: string) => {
  const existing = await getMonthlyBudget(month);
  if (existing) return existing;
  return await generateMonthlyBudget(month);
};

export const getExpenses = async (month: string) => {
  const response = await api.get(`/expenses?month=${month}`);
  return response.data;
};

export const createExpense = async (expense: { amount: number; category: string; note?: string; date?: string }) => {
  const response = await api.post('/expenses', {
    userId,
    amount: expense.amount,
    category: expense.category,
    date: expense.date || new Date().toISOString().slice(0, 10),
    createdBy: "Georges",
    ...(expense.note ? { note: expense.note } : {}),
  });
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// --- Budget Template Categories ---

let cachedTemplateId: string | null = null;

export const getCategories = async () => {
  const response = await api.get(`/budget-template?userId=${userId}`);
  const templates = response.data;
  if (Array.isArray(templates) && templates.length > 0) {
    cachedTemplateId = templates[0]._id;
    return templates[0];
  }
  return { categories: [] };
};

const getTemplateId = async () => {
  if (cachedTemplateId) return cachedTemplateId;
  const tmpl = await getCategories();
  return cachedTemplateId!;
};

export const addCategory = async (category: { name: string; type: string; limit: number }) => {
  const id = await getTemplateId();
  const response = await api.post(`/budget-template/${id}/categories`, category);
  return response.data;
};

export const editCategory = async (categoryName: string, updates: { limit?: number; type?: string }) => {
  const id = await getTemplateId();
  const response = await api.patch(`/budget-template/${id}/categories/${encodeURIComponent(categoryName)}`, updates);
  return response.data;
};

export const deleteCategory = async (categoryName: string) => {
  const id = await getTemplateId();
  const response = await api.delete(`/budget-template/${id}/categories/${encodeURIComponent(categoryName)}`);
  return response.data;
};

// --- Savings ---

export const getSavings = async (month: string) => {
  const response = await api.get(`/savings?month=${month}`);
  return response.data;
};

export const getSavingsSummary = async () => {
  const response = await api.get(`/savings/summary?userId=${userId}`);
  return response.data;
};

export const createSaving = async (saving: { amount: number; category: string; note?: string; date?: string }) => {
  const response = await api.post('/savings', {
    userId,
    amount: saving.amount,
    category: saving.category,
    date: saving.date || new Date().toISOString().slice(0, 10),
    createdBy: "Georges",
    ...(saving.note ? { note: saving.note } : {}),
  });
  return response.data;
};

export const deleteSaving = async (id: string) => {
  const response = await api.delete(`/savings/${id}`);
  return response.data;
};

// --- Savings Categories ---

export const getSavingsCategories = async () => {
  const tmpl = await getCategories();
  return tmpl?.savingsCategories ?? [];
};

export const addSavingsCategory = async (category: { name: string; targetAmount: number }) => {
  const id = await getTemplateId();
  const response = await api.post(`/budget-template/${id}/savings-categories`, category);
  return response.data;
};

export const deleteSavingsCategory = async (categoryName: string) => {
  const id = await getTemplateId();
  const response = await api.delete(`/budget-template/${id}/savings-categories/${encodeURIComponent(categoryName)}`);
  return response.data;
};

// --- Incomes ---

export const getIncomes = async (month: string) => {
  const response = await api.get(`/incomes?month=${month}`);
  return response.data;
};

export const createIncome = async (income: { amount: number; source: string; note?: string; date?: string }) => {
  const response = await api.post('/incomes', {
    userId,
    amount: income.amount,
    source: income.source,
    date: income.date || new Date().toISOString().slice(0, 10),
    createdBy: "Georges",
    ...(income.note ? { note: income.note } : {}),
  });
  return response.data;
};

export const deleteIncome = async (id: string) => {
  const response = await api.delete(`/incomes/${id}`);
  return response.data;
};

// --- Income Categories ---

export const getIncomeCategories = async () => {
  const tmpl = await getCategories();
  return tmpl?.incomeCategories ?? [];
};

export const addIncomeCategory = async (category: { name: string; expectedAmount: number }) => {
  const id = await getTemplateId();
  const response = await api.post(`/budget-template/${id}/income-categories`, category);
  return response.data;
};

export const deleteIncomeCategory = async (categoryName: string) => {
  const id = await getTemplateId();
  const response = await api.delete(`/budget-template/${id}/income-categories/${encodeURIComponent(categoryName)}`);
  return response.data;
};

export default api;
