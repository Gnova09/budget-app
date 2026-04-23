import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { AddExpenseScreen } from './screens/AddExpenseScreen';
import { AddIncomeScreen } from './screens/AddIncomeScreen';
import { AddSavingScreen } from './screens/AddSavingScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { IncomeCategoriesScreen } from './screens/IncomeCategoriesScreen';
import { IncomesScreen } from './screens/IncomesScreen';
import { SavingsCategoriesScreen } from './screens/SavingsCategoriesScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import * as Api from './services/api';
import { styles } from './styles';
import { darkColors, lightColors, ThemeContext } from './theme';
import type { DashboardData, Expense, Income, IncomeCat, Saving, SavingsCat, Screen } from './types';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');
  const [prevScreen, setPrevScreen] = useState<Screen>('Home');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [savingsCategories, setSavingsCategories] = useState<SavingsCat[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCat[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState<string | undefined>(undefined);
  const dataLoadedRef = useRef(false);
  const [currentMonth, setCurrentMonth] = useState(Api.getAutoMonth());

  const c = isDark ? darkColors : lightColors;

  // Deep link handler for widget
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.startsWith('budgetapp://quick-add')) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        const cat = params.get('category');
        if (cat) setQuickAddCategory(decodeURIComponent(cat));
        setShowQuickAdd(true);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((val) => {
      if (val === 'light') setIsDark(false);
      else if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const themeCtx = useMemo(() => ({ isDark, toggleTheme, c }), [isDark, c]);

  const handleNav = (screen: Screen) => {
    setPrevScreen(activeScreen);
    setActiveScreen(screen);
  };

  const loadData = async () => {
    try {
      await Api.ensureMonthlyBudget(currentMonth).catch(() => {});

      const [dash, exps, savs, incs, savCats, incCats] = await Promise.all([
        Api.getDashboard(currentMonth),
        Api.getExpenses(currentMonth),
        Api.getSavings(currentMonth).catch(() => []),
        Api.getIncomes(currentMonth).catch(() => []),
        Api.getSavingsCategories().catch(() => []),
        Api.getIncomeCategories().catch(() => []),
      ]);

      setDashboardData(dash);
      setExpenses(exps ?? []);
      setSavings(savs ?? []);
      setIncomes(incs ?? []);
      setSavingsCategories(savCats ?? []);
      setIncomeCategories(incCats ?? []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const handleSaveExpense = async (expense: any) => {
    try {
      await Api.createExpense(expense);
      await loadData();
      setQuickAddCategory(undefined);
      setActiveScreen('Home');
    } catch (err) {
      console.error('Failed to save expense', err);
    }
  };

  const handleSaveSaving = async (saving: { amount: number; category: string; note?: string }) => {
    try {
      await Api.createSaving(saving);
      await loadData();
      setActiveScreen('Savings');
    } catch (err) {
      console.error('Failed to save saving', err);
    }
  };

  const handleSaveIncome = async (income: { amount: number; source: string; note?: string }) => {
    try {
      await Api.createIncome(income);
      await loadData();
      setActiveScreen('Incomes');
    } catch (err) {
      console.error('Failed to save income', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    Alert.alert('Eliminar gasto', '¿Estás seguro de que deseas eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await Api.deleteExpense(id);
            await loadData();
          } catch (err) {
            console.error('Failed to delete expense', err);
          }
        },
      },
    ]);
  };

  const handleDeleteSaving = async (id: string) => {
    Alert.alert('Eliminar ahorro', '¿Estás seguro de que deseas eliminar este ahorro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await Api.deleteSaving(id);
            await loadData();
          } catch (err) {
            console.error('Failed to delete saving', err);
          }
        },
      },
    ]);
  };

  const handleDeleteIncome = async (id: string) => {
    Alert.alert('Eliminar ingreso', '¿Estás seguro de que deseas eliminar este ingreso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await Api.deleteIncome(id);
            await loadData();
          } catch (err) {
            console.error('Failed to delete income', err);
          }
        },
      },
    ]);
  };

  const fullScreens: Screen[] = ['Add', 'AddSaving', 'AddIncome', 'Categories', 'SavingsCategories', 'IncomeCategories'];
  const isFullScreen = fullScreens.includes(activeScreen);

  return (
    <ThemeContext.Provider value={themeCtx}>
    <SafeAreaView style={[styles.container, { backgroundColor: c.surface }]}>
      <StatusBar barStyle={c.statusBar} backgroundColor={c.surface} />
      {!isFullScreen && <TopBar title={activeScreen} />}

      <View style={{ flex: 1 }}>
        {activeScreen === 'Home' && (
          <HomeScreen data={dashboardData} expenses={expenses} incomes={incomes} />
        )}
        {activeScreen === 'Budget' && (
          <BudgetScreen data={dashboardData} expenses={expenses} onDeleteExpense={handleDeleteExpense} />
        )}
        {activeScreen === 'Savings' && (
          <SavingsScreen savings={savings} savingsCategories={savingsCategories} onDelete={handleDeleteSaving} onNav={handleNav} />
        )}
        {activeScreen === 'Incomes' && (
          <IncomesScreen incomes={incomes} incomeCategories={incomeCategories} onDelete={handleDeleteIncome} onNav={handleNav} />
        )}
        {activeScreen === 'Settings' && (
          <SettingsScreen
            onNavCategories={() => handleNav('Categories')}
            onNavSavingsCategories={() => handleNav('SavingsCategories')}
            onNavIncomeCategories={() => handleNav('IncomeCategories')}
            selectedMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
        {activeScreen === 'Categories' && (
          <CategoriesScreen onBack={() => setActiveScreen('Settings')} onReload={loadData} />
        )}
        {activeScreen === 'SavingsCategories' && (
          <SavingsCategoriesScreen onBack={() => setActiveScreen('Settings')} onReload={loadData} />
        )}
        {activeScreen === 'IncomeCategories' && (
          <IncomeCategoriesScreen onBack={() => setActiveScreen('Settings')} onReload={loadData} />
        )}
      </View>

      {activeScreen === 'Add' && (
        <AddExpenseScreen
          onSave={handleSaveExpense}
          onCancel={() => { setQuickAddCategory(undefined); setActiveScreen(prevScreen); }}
          budgetCategories={dashboardData?.categories ?? []}
          initialCategory={quickAddCategory}
        />
      )}

      {activeScreen === 'AddSaving' && (
        <AddSavingScreen
          onSave={handleSaveSaving}
          onCancel={() => setActiveScreen(prevScreen)}
          savingsCategories={savingsCategories}
        />
      )}

      {activeScreen === 'AddIncome' && (
        <AddIncomeScreen
          onSave={handleSaveIncome}
          onCancel={() => setActiveScreen(prevScreen)}
          incomeCategories={incomeCategories}
        />
      )}

      {activeScreen === 'Savings' && (
        <TouchableOpacity onPress={() => handleNav('AddSaving')} style={[styles.fab, { backgroundColor: '#10b981' }]}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {activeScreen === 'Incomes' && (
        <TouchableOpacity onPress={() => handleNav('AddIncome')} style={[styles.fab, { backgroundColor: '#f59e0b' }]}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {(activeScreen === 'Home' || activeScreen === 'Budget') && (
        <TouchableOpacity onPress={() => handleNav('Add')} style={styles.fab}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {!isFullScreen && (
        <BottomNav active={['Add', 'AddSaving', 'AddIncome'].includes(activeScreen) ? prevScreen as Screen : activeScreen} onNav={handleNav} />
      )}
    </SafeAreaView>
    </ThemeContext.Provider>
  );
}
