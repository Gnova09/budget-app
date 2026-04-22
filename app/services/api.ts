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

export default api;
