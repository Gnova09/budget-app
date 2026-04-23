export type Screen =
  | 'Home'
  | 'History'
  | 'Budget'
  | 'Settings'
  | 'Add'
  | 'Categories'
  | 'Savings'
  | 'Incomes'
  | 'AddSaving'
  | 'AddIncome'
  | 'SavingsCategories'
  | 'IncomeCategories';

export interface Expense {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  note: string;
  date: string;
}

export interface Saving {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export interface Income {
  _id: string;
  userId: string;
  source: string;
  amount: number;
  note?: string;
  date: string;
}

export interface SavingsCat {
  name: string;
  targetAmount: number;
}

export interface IncomeCat {
  name: string;
  expectedAmount: number;
}

export interface CategorySummary {
  category: string;
  limit: number;
  spent: number;
  available: number;
}

export interface DashboardData {
  totalBudget: number;
  totalSpent: number;
  categories: CategorySummary[];
}

export interface TemplateCategory {
  name: string;
  type: string;
  limit: number;
}

export interface SavingsSummary {
  total: number;
  byCategory: { category: string; amount: number }[];
  byMonth: { month: string; amount: number }[];
}

export const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
