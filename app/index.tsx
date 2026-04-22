import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Banknote,
  Bell,
  Calendar,
  Car,
  Check,
  ChevronRight,
  Church,
  Clapperboard,
  Download,
  Droplets,
  Fuel,
  Heart,
  Home as HomeIcon,
  LogOut,
  MonitorSmartphone,
  Moon,
  MoreHorizontal,
  Pencil,
  Pill,
  Pizza,
  Plane,
  Plus,
  Receipt,
  ReceiptText,
  RefreshCw,
  Scissors,
  Search,
  Settings,
  Shapes,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sun,
  Trash2,
  Tv,
  Utensils,
  Wallet,
  Wallpaper,
  Wifi,
  X
} from 'lucide-react-native';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Circle as SvgCircle } from 'react-native-svg';
import * as Api from './services/api';

// --- Types ---
type Screen = 'Home' | 'History' | 'Budget' | 'Settings' | 'Add' | 'Categories';

interface Expense {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  note: string;
  date: string;
}

interface CategorySummary {
  category: string;
  limit: number;
  spent: number;
  available: number;
}

interface DashboardData {
  totalBudget: number;
  totalSpent: number;
  categories: CategorySummary[];
}

// --- Colors ---
const darkColors = {
  surface: '#09090b',
  surfaceBright: '#18181b',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
  primary: '#6366f1',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc600: '#52525b',
  zinc800: '#27272a',
  indigo400: '#818cf8',
  rose400: '#fb7185',
  error: '#fb7185',
  white10: 'rgba(255,255,255,0.1)',
  white5: 'rgba(255,255,255,0.05)',
  white60: 'rgba(255,255,255,0.6)',
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',
  navBg: 'rgba(24,24,27,0.9)',
  progressBg: 'rgba(255,255,255,0.1)',
  statusBar: 'light-content' as const,
};

const lightColors = {
  surface: '#f5f5f7',
  surfaceBright: '#ffffff',
  onSurface: '#1a1a1a',
  onSurfaceVariant: '#6b7280',
  primary: '#6366f1',
  zinc400: '#9ca3af',
  zinc500: '#6b7280',
  zinc600: '#9ca3af',
  zinc800: '#d1d5db',
  indigo400: '#6366f1',
  rose400: '#e11d48',
  error: '#e11d48',
  white10: 'rgba(0,0,0,0.06)',
  white5: 'rgba(0,0,0,0.03)',
  white60: 'rgba(0,0,0,0.5)',
  cardBg: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.08)',
  navBg: 'rgba(255,255,255,0.95)',
  progressBg: 'rgba(0,0,0,0.08)',
  statusBar: 'dark-content' as const,
};

type ThemeColors = Omit<typeof darkColors, 'statusBar'> & { statusBar: 'light-content' | 'dark-content' };

// Keep a mutable ref for backward compat with static styles
let colors: ThemeColors = darkColors;

// --- Theme Context ---
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
  c: ThemeColors;
}>({ isDark: true, toggleTheme: () => {}, c: darkColors });

const useTheme = () => useContext(ThemeContext);

// --- Components ---

const TopBar = ({ title, showBack, onBack }: { title: string; showBack?: boolean; onBack?: () => void }) => {
  const { c } = useTheme();
  return (
  <View style={[styles.topBar, { backgroundColor: c.surface }]}>
    <View style={styles.topBarLeft}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <X size={20} color={c.onSurface} />
        </TouchableOpacity>
      ) : (
        <LinearGradient colors={['#6366f1', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </LinearGradient>
      )}
      {!showBack && <Text style={[styles.appTitle, { color: c.onSurface }]}>Finanzas</Text>}
    </View>
    {showBack && <Text style={[styles.screenTitle, { color: c.onSurface }]}>{title}</Text>}
    {!showBack && (
      <TouchableOpacity style={styles.iconBtn}>
        <Bell size={20} color={c.onSurface} />
      </TouchableOpacity>
    )}
    {showBack && <View style={{ width: 40 }} />}
  </View>
  );
};

const BottomNav = ({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) => {
  const { c } = useTheme();
  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'Home', icon: HomeIcon, label: 'Inicio' },
    { id: 'Budget', icon: Wallet, label: 'Presupuesto' },
    { id: 'History', icon: ReceiptText, label: 'Historial' },
    { id: 'Settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <View style={[styles.bottomNav, { backgroundColor: c.navBg, borderTopColor: c.cardBorder }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <TouchableOpacity key={tab.id} onPress={() => onNav(tab.id)} style={styles.navTab}>
            <Icon size={20} color={isActive ? c.primary : c.zinc600} />
            <Text style={[styles.navLabel, { color: isActive ? c.primary : c.zinc600 }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- Screens ---

const DONUT_COLORS = ['#1f2937', '#6b7280', '#9ca3af', '#c4b5fd'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const DonutChart = ({ segments, size = 160, strokeWidth = 28 }: {
  segments: { percent: number; color: string }[]; size?: number; strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {segments.map((seg, i) => {
          const dash = (seg.percent / 100) * circumference;
          const gap = circumference - dash;
          const o = offset;
          offset += dash;
          return (
            <SvgCircle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-o}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </G>
    </Svg>
  );
};

interface MonthlySpend { month: string; label: string; total: number }

const HomeScreen = ({ data, expenses }: { data: DashboardData | null; expenses: Expense[] }) => {
  const { c } = useTheme();
  const [trend, setTrend] = useState<MonthlySpend[]>([]);

  // Load 6-month spending trend
  useEffect(() => {
    const loadTrend = async () => {
      const now = new Date();
      const months: MonthlySpend[] = [];
      const promises = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = MONTH_LABELS[d.getMonth()];
        months.push({ month: key, label, total: 0 });
        promises.push(
          Api.getDashboard(key)
            .then((dash: DashboardData) => { months[5 - i].total = dash?.totalSpent ?? 0; })
            .catch(() => {})
        );
      }
      await Promise.all(promises);
      setTrend([...months]);
    };
    loadTrend();
  }, []);

  if (!data) return <View style={styles.centered}><Text style={[styles.loadingText, { color: c.onSurfaceVariant }]}>Cargando...</Text></View>;

  const totalBudget = data.totalBudget ?? 0;
  const totalSpent = data.totalSpent ?? 0;
  const remaining = totalBudget - totalSpent;
  const usedPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const categories = data.categories ?? [];

  // Build top-N categories for donut + "Others"
  const sorted = [...categories].sort((a, b) => b.spent - a.spent);
  const topN = 3;
  const topCats = sorted.slice(0, topN);
  const othersSpent = sorted.slice(topN).reduce((s, cat) => s + cat.spent, 0);
  const donutData = [
    ...topCats.map((cat, i) => ({
      category: cat.category,
      spent: cat.spent,
      percent: totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    })),
    ...(othersSpent > 0 ? [{
      category: 'Otros',
      spent: othersSpent,
      percent: totalSpent > 0 ? Math.round((othersSpent / totalSpent) * 100) : 0,
      color: DONUT_COLORS[3],
    }] : []),
  ];

  // Month label
  const now = new Date();
  const monthLabel = MONTH_LABELS[now.getMonth()];

  // Bar chart max
  const maxTrend = Math.max(...trend.map(t => t.total), 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>

      {/* Total Spent vs Budget */}
      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>  
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: c.zinc500, fontSize: 13, fontWeight: '500' }}>Total Gastado vs Presupuesto</Text>
          <View style={[homeS.monthBadge, { backgroundColor: c.white10 }]}>
            <Calendar size={14} color={c.onSurface} />
            <Text style={{ color: c.onSurface, fontSize: 12, fontWeight: '600' }}>{monthLabel}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ color: c.onSurface, fontSize: 28, fontWeight: '800' }}>
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text style={{ color: c.zinc500, fontSize: 14 }}>
            / ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[homeS.progressBg, { backgroundColor: c.progressBg, marginTop: 12 }]}>
          <View style={[homeS.progressFill, { width: `${usedPercent}%`, backgroundColor: c.onSurface }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ color: c.zinc500, fontSize: 12 }}>{Math.round(usedPercent)}% usado</Text>
          <Text style={{ color: c.zinc500, fontSize: 12 }}>
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} restante
          </Text>
        </View>
      </View>

      {/* Expense Breakdown — Donut */}
      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>  
        <Text style={[homeS.cardTitle, { color: c.onSurface }]}>Desglose de Gastos</Text>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <View>
            <DonutChart
              segments={donutData.map(d => ({ percent: d.percent, color: d.color }))}
              size={170}
              strokeWidth={30}
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={22} color={c.zinc500} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {donutData.map(d => (
            <View key={d.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '48%', marginBottom: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
              <Text style={{ color: c.onSurface, fontSize: 13 }}>{d.category} {d.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Spending Trend — Bar Chart */}
      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>  
        <Text style={[homeS.cardTitle, { color: c.onSurface }]}>Tendencia de Gastos</Text>
        <View style={homeS.barContainer}>
          {trend.map((m, i) => {
            const h = maxTrend > 0 ? (m.total / maxTrend) * 130 : 0;
            const isCurrent = i === trend.length - 1;
            return (
              <View key={m.month} style={{ alignItems: 'center', flex: 1 }}>
                <View style={[homeS.bar, {
                  height: Math.max(h, 4),
                  backgroundColor: isCurrent ? c.onSurface : (c.progressBg),
                  borderRadius: 6,
                }]} />
                <Text style={{
                  color: isCurrent ? c.onSurface : c.zinc500,
                  fontSize: 11,
                  fontWeight: isCurrent ? '700' : '400',
                  marginTop: 6,
                }}>{m.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Categories Breakdown */}
      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>  
        <Text style={[homeS.cardTitle, { color: c.onSurface }]}>Categorías</Text>
        {donutData.map((d, i) => (
          <View key={d.category} style={[homeS.catRow, i < donutData.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[homeS.catIcon, { backgroundColor: d.color + '22' }]}>
                {d.category === 'Otros'
                  ? <Shapes size={18} color={d.color} />
                  : getCategoryIcon(d.category, 18, d.color)}
              </View>
              <View>
                <Text style={{ color: c.onSurface, fontSize: 14, fontWeight: '600' }}>{d.category}</Text>
                <Text style={{ color: c.zinc500, fontSize: 12 }}>{d.percent}%</Text>
              </View>
            </View>
            <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>
              ${d.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const homeS = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 170,
    marginTop: 16,
    paddingBottom: 4,
  },
  bar: {
    width: 36,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const HistoryScreen = ({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) => {
  const { c } = useTheme();
  return (
  <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: c.zinc400 }]}>Transacciones Recientes</Text>
      <Text style={[styles.sectionAction, { color: c.indigo400 }]}>Filtrar</Text>
    </View>

    {expenses.length === 0 && (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <Text style={{ color: c.zinc500 }}>No hay transacciones este mes</Text>
      </View>
    )}

    {expenses.map((exp, index) => (
      <View key={exp._id ?? `exp-${index}`} style={[styles.historyCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={[styles.catLeft, { flex: 1 }]}>
          <View style={[styles.catIconBox, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
            {getCategoryIcon(exp.category, 20, c.indigo400)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.catName, { color: c.onSurface }]}>{exp.note}</Text>
            <Text style={[styles.catSub, { color: c.zinc500 }]}>{exp.category} • {exp.date}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={[styles.expAmount, { color: c.rose400 }]}>-${exp.amount.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => exp._id && onDelete(exp._id)} style={styles.deleteBtn}>
            <Trash2 size={16} color={c.error} />
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
  );
};

// --- Budget Screen ---

const BudgetScreen = ({ data }: { data: DashboardData | null }) => {
  const { c } = useTheme();
  const [search, setSearch] = useState('');
  if (!data) return <View style={styles.centered}><Text style={styles.loadingText}>Cargando...</Text></View>;

  const totalBudget = data.totalBudget ?? 0;
  const totalSpent = data.totalSpent ?? 0;
  const totalAvailable = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const categories = data.categories ?? [];

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const now = new Date();
  const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={[styles.budgetTitle, { color: c.onSurface }]}>Presupuesto Mensual</Text>
        <Text style={[styles.budgetMonth, { color: c.zinc500 }]}>{monthLabel}</Text>
      </View>

      {/* Summary Card */}
      <View style={[styles.budgetSummaryCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={styles.budgetSummaryRow}>
          <View>
            <Text style={[styles.budgetSummaryLabel, { color: c.zinc500 }]}>Total Disponible</Text>
            <Text style={[styles.budgetSummaryAmount, { color: c.onSurface }]}>${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.budgetSummaryLabel, { color: c.zinc500 }]}>Presupuesto Total</Text>
            <Text style={[styles.budgetSummaryBudget, { color: c.onSurface }]}>${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>
        <View style={[styles.budgetProgressBg, { backgroundColor: c.progressBg }]}>
          <View style={[styles.budgetProgressFill, { width: `${spentPercent}%`, backgroundColor: spentPercent >= 100 ? c.error : c.onSurface }]} />
        </View>
        <Text style={[styles.budgetPercentText, { color: c.zinc500 }]}>{spentPercent.toFixed(2)}% gastado</Text>
      </View>

      {/* Categories */}
      <Text style={[styles.budgetCatHeader, { color: c.onSurface }]}>Categorías</Text>

      <View style={[styles.searchBox, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <Search size={18} color={c.zinc500} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar categoría..."
          placeholderTextColor={c.zinc600}
          style={[styles.searchInput, { color: c.onSurface }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color={c.zinc500} />
          </TouchableOpacity>
        )}
      </View>

      {categories
        .filter((cat) => cat.category.toLowerCase().includes(search.toLowerCase()))
        .map((cat) => {
        const spent = cat.spent ?? 0;
        const limit = cat.limit ?? 1;
        const available = cat.available ?? (limit - spent);
        const percent = Math.min((spent / limit) * 100, 100);
        const isOver = spent > limit;

        return (
          <View key={cat.category} style={[styles.budgetCatCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <View style={styles.budgetCatTop}>
              <View style={styles.catLeft}>
                <View style={[styles.catIconBox, { backgroundColor: 'rgba(99,102,241,0.08)' }]}>
                  {getCategoryIcon(cat.category, 20, c.onSurface)}
                </View>
                <Text style={[styles.budgetCatName, { color: c.onSurface }]}>{cat.category}</Text>
              </View>
              <TouchableOpacity style={styles.budgetEditBtn}>
                <Pencil size={16} color={c.zinc500} />
              </TouchableOpacity>
            </View>
            <View style={styles.budgetCatBottom}>
              <Text style={[styles.budgetCatSpent, isOver && { color: c.error }]}>
                ${spent.toLocaleString()} gastado
              </Text>
              <Text style={[styles.budgetCatLimit, { color: c.onSurface }]}>${limit.toLocaleString()} límite</Text>
            </View>
            <View style={[styles.budgetProgressBg, { backgroundColor: c.progressBg }]}>
              <View style={[styles.budgetProgressFill, { width: `${percent}%`, backgroundColor: isOver ? c.error : c.onSurface }]} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const AddExpenseScreen = ({ onSave, onCancel, budgetCategories }: { onSave: (e: any) => void; onCancel: () => void; budgetCategories: CategorySummary[] }) => {
  const { c } = useTheme();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(budgetCategories.length > 0 ? budgetCategories[0].category : '');
  const [note, setNote] = useState('');
  const [catSearch, setCatSearch] = useState('');

  const filteredCats = budgetCategories.filter((c) =>
    c.category.toLowerCase().includes(catSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!amount || !category) return;
    onSave({ amount: parseFloat(amount), category, note });
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, zIndex: 60, paddingTop: 24 }]}>
      <TopBar title="Agregar Gasto" showBack onBack={onCancel} />
      <ScrollView style={{ flex: 1, paddingTop: 80 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Amount */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={[styles.labelSmall, { marginBottom: 16 }]}>Monto</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.zinc600, marginBottom: 4 }}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.zinc800}
              keyboardType="decimal-pad"
              autoFocus
              style={{ fontSize: 48, fontWeight: 'bold', color: colors.onSurface, textAlign: 'center', minWidth: 200 }}
            />
          </View>
        </View>

        {/* Category List */}
        <View style={{ marginBottom: 25 }}>
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Seleccionar Categoria</Text>
          <View style={styles.searchBox}>
            <Search size={18} color={colors.zinc500} />
            <TextInput
              value={catSearch}
              onChangeText={setCatSearch}
              placeholder="Buscar categoria..."
              placeholderTextColor={colors.zinc600}
              style={styles.searchInput}
            />
            {catSearch.length > 0 && (
              <TouchableOpacity onPress={() => setCatSearch('')}>
                <X size={16} color={colors.zinc500} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 12 }}>
          {filteredCats.map((cat) => {
            const isSelected = category === cat.category;
            return (
              <TouchableOpacity
                key={cat.category}
                onPress={() => setCategory(cat.category)}
                style={[
                  styles.addCatItem,
                  isSelected && styles.addCatItemSelected,
                ]}
              >
                <View style={styles.catLeft}>
                  <View style={[styles.catIconBox, { backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : colors.white5 }]}>
                    {getCategoryIcon(cat.category, 20, isSelected ? colors.primary : colors.onSurface)}
                  </View>
                  <View>
                    <Text style={[styles.catName, isSelected && { color: colors.primary }]}>{cat.category}</Text>
                    <Text style={styles.catSub}>Disponible: ${(cat.available ?? (cat.limit - cat.spent)).toLocaleString()}</Text>
                  </View>
                </View>
                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
          </ScrollView>
        </View>

        {/* Note */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Nota (Opcional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="En qué fue este gasto?"
            placeholderTextColor={colors.zinc600}
            style={styles.noteInput}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient colors={['#6366f1', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtn}>
            <Check size={24} color="#fff" />
            <Text style={styles.submitText}>Guardar Gasto</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// --- Settings Screen ---

const SettingsScreen = ({ onNavCategories }: { onNavCategories?: () => void }) => {
  const { isDark, toggleTheme, c } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const SettingRow = ({ icon, label, right, last, onPress }: {
    icon: React.ReactNode; label: string; right?: React.ReactNode; last?: boolean; onPress?: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      style={[styles.settingsRow, !last && { borderBottomWidth: 1, borderBottomColor: c.cardBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {icon}
        <Text style={{ fontSize: 15, color: c.onSurface }}>{label}</Text>
      </View>
      {right}
    </TouchableOpacity>
  );

  const Chevron = () => <ChevronRight size={18} color={c.zinc500} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>

      {/* Profile Card */}
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder, alignItems: 'center', paddingVertical: 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={[stl.avatar, { borderColor: c.primary }]}>
              <Text style={{ fontSize: 28 }}>👨‍💼</Text>
            </View>
            <Text style={{ color: c.onSurface, marginTop: 8, fontWeight: '600', fontSize: 14 }}>Georges</Text>
          </View>
          <Heart size={20} color={c.zinc400} />
          <View style={{ alignItems: 'center' }}>
            <View style={[stl.avatar, { borderColor: c.zinc400 }]}>
              <Text style={{ fontSize: 28 }}>👩‍💼</Text>
            </View>
            <Text style={{ color: c.onSurface, marginTop: 8, fontWeight: '600', fontSize: 14 }}>Nicole</Text>
          </View>
        </View>
      </View>

      {/* PREFERENCIAS */}
      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>PREFERENCIAS</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <SettingRow
          icon={<Bell size={20} color={c.primary} />}
          label="Notificaciones de Presupuesto"
          right={
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: '#d1d5db', true: '#6366f1' }}
              thumbColor="#fff"
            />
          }
        />
        <SettingRow
          icon={<Wallpaper size={20} color={c.primary} />}
          label="Moneda"
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: c.zinc500, fontSize: 14 }}>USD ($)</Text>
              <Chevron />
            </View>
          }
          last
        />
      </View>

      {/* PERSONALIZACIÓN */}
      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>PERSONALIZACIÓN</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <SettingRow
          icon={isDark ? <Moon size={20} color={c.primary} /> : <Sun size={20} color={c.primary} />}
          label="Apariencia"
          onPress={toggleTheme}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: c.zinc500, fontSize: 14 }}>{isDark ? 'Oscuro' : 'Claro'}</Text>
              <Chevron />
            </View>
          }
        />
        <SettingRow
          icon={<Shapes size={20} color={c.primary} />}
          label="Administrar Categorías"
          onPress={() => onNavCategories && onNavCategories()}
          right={<Chevron />}
          last
        />
      </View>

      {/* CUENTA */}
      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>CUENTA</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <SettingRow
          icon={<RefreshCw size={20} color={c.primary} />}
          label="Sincronizar Datos"
          right={
            <Text style={{ color: c.zinc500, fontSize: 14 }}>Justo ahora</Text>
          }
        />
        <SettingRow
          icon={<Download size={20} color={c.primary} />}
          label="Exportar Datos (CSV)"
          right={<Chevron />}
        />
        <SettingRow
          icon={<LogOut size={20} color={c.error} />}
          label="Cerrar Sesión"
          right={null}
          last
        />
      </View>
    </ScrollView>
  );
};

const stl = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
});

// --- Categories Screen ---

interface TemplateCategory {
  name: string;
  type: string;
  limit: number;
}

const categoryIconColors: Record<string, string> = {
  housing: '#bfdbfe',
  alquiler: '#bfdbfe',
  apartamento: '#bfdbfe',
  food: '#ddd6fe',
  comida: '#ddd6fe',
  supermercado: '#ddd6fe',
  transport: '#fde68a',
  transporte: '#fde68a',
  combustible: '#fde68a',
  fun: '#bfdbfe',
  ocio: '#bfdbfe',
  salida: '#bfdbfe',
  bills: '#e5e7eb',
  factura: '#e5e7eb',
  luz: '#e5e7eb',
  shopping: '#bfdbfe',
  compra: '#bfdbfe',
};

const getCatIconBg = (name: string) => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(categoryIconColors)) {
    if (lower.includes(key)) return categoryIconColors[key];
  }
  return '#e5e7eb';
};

const CategoriesScreen = ({ onBack, onReload }: { onBack: () => void; onReload: () => void }) => {
  const { c } = useTheme();
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editCat, setEditCat] = useState<TemplateCategory | null>(null);
  const [editLimit, setEditLimit] = useState('');

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('variable');
  const [newLimit, setNewLimit] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await Api.getCategories();
      setCategories(data?.categories ?? []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newLimit.trim()) return;
    try {
      await Api.addCategory({ name: newName.trim(), type: newType, limit: parseFloat(newLimit) });
      setNewName(''); setNewLimit(''); setNewType('variable'); setShowAdd(false);
      await loadCategories();
      onReload();
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const handleEdit = async () => {
    if (!editCat || !editLimit.trim()) return;
    try {
      await Api.editCategory(editCat.name, { limit: parseFloat(editLimit) });
      setEditCat(null); setEditLimit('');
      await loadCategories();
      onReload();
    } catch (err) {
      console.error('Failed to edit category', err);
    }
  };

  const handleDelete = (cat: TemplateCategory) => {
    Alert.alert('Eliminar categoría', `¿Eliminar "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await Api.deleteCategory(cat.name);
            await loadCategories();
            onReload();
          } catch (err) {
            console.error('Failed to delete category', err);
          }
        },
      },
    ]);
  };

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: c.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: c.onSurface }]}>Categorías</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.iconBtn}>
          <Plus size={22} color={c.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
          <Search size={18} color={c.zinc500} />
          <TextInput
            style={[styles.searchInput, { color: c.onSurface }]}
            placeholder="Buscar categorías"
            placeholderTextColor={c.zinc500}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Add New Card */}
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={[catStyles.addCard, { borderColor: c.zinc400 }]}>
          <View style={[catStyles.addIconCircle, { backgroundColor: c.white10 }]}>
            <Plus size={22} color={c.zinc500} />
          </View>
          <View>
            <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>Agregar Categoría</Text>
            <Text style={{ color: c.zinc500, fontSize: 13 }}>Crear tracker personalizado</Text>
          </View>
        </TouchableOpacity>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: c.zinc500 }}>Cargando...</Text>
          </View>
        ) : filtered.map((cat) => (
          <View key={cat.name} style={[catStyles.catCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
              <View style={[catStyles.catCircle, { backgroundColor: getCatIconBg(cat.name) }]}>
                {getCategoryIcon(cat.name, 22, '#374151')}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>{cat.name}</Text>
                <Text style={{ color: c.zinc500, fontSize: 13 }}>Límite: ${cat.limit.toLocaleString()}/mes</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => { setEditCat(cat); setEditLimit(String(cat.limit)); }}
              style={{ padding: 8 }}>
              <Pencil size={18} color={c.zinc500} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Edit Modal */}
      {editCat && (
        <View style={catStyles.modalOverlay}>
          <View style={[catStyles.modalBox, { backgroundColor: c.surfaceBright }]}>
            <Text style={[catStyles.modalTitle, { color: c.onSurface }]}>Editar "{editCat.name}"</Text>
            <Text style={{ color: c.zinc500, marginBottom: 8 }}>Nuevo límite mensual</Text>
            <TextInput
              style={[catStyles.modalInput, { color: c.onSurface, borderColor: c.cardBorder, backgroundColor: c.cardBg }]}
              keyboardType="numeric"
              value={editLimit}
              onChangeText={setEditLimit}
              placeholder="Ej. 500"
              placeholderTextColor={c.zinc500}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => handleDelete(editCat)}
                style={[catStyles.modalBtn, { backgroundColor: 'rgba(251,113,133,0.12)' }]}>
                <Trash2 size={16} color={c.error} />
                <Text style={{ color: c.error, fontWeight: '600' }}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditCat(null)}
                style={[catStyles.modalBtn, { backgroundColor: c.white10, flex: 1 }]}>
                <Text style={{ color: c.onSurface, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                style={[catStyles.modalBtn, { backgroundColor: c.primary, flex: 1 }]}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Modal */}
      {showAdd && (
        <View style={catStyles.modalOverlay}>
          <View style={[catStyles.modalBox, { backgroundColor: c.surfaceBright }]}>
            <Text style={[catStyles.modalTitle, { color: c.onSurface }]}>Nueva Categoría</Text>
            <Text style={{ color: c.zinc500, marginBottom: 4 }}>Nombre</Text>
            <TextInput
              style={[catStyles.modalInput, { color: c.onSurface, borderColor: c.cardBorder, backgroundColor: c.cardBg }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej. Shopping"
              placeholderTextColor={c.zinc500}
            />
            <Text style={{ color: c.zinc500, marginBottom: 4, marginTop: 12 }}>Tipo</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {['fixed', 'variable'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewType(t)}
                  style={[catStyles.typeBtn, {
                    backgroundColor: newType === t ? c.primary : c.white10,
                  }]}>
                  <Text style={{ color: newType === t ? '#fff' : c.onSurface, fontWeight: '600', fontSize: 13 }}>
                    {t === 'fixed' ? 'Fijo' : 'Variable'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: c.zinc500, marginBottom: 4 }}>Límite mensual</Text>
            <TextInput
              style={[catStyles.modalInput, { color: c.onSurface, borderColor: c.cardBorder, backgroundColor: c.cardBg }]}
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
              placeholder="Ej. 500"
              placeholderTextColor={c.zinc500}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => { setShowAdd(false); setNewName(''); setNewLimit(''); }}
                style={[catStyles.modalBtn, { backgroundColor: c.white10, flex: 1 }]}>
                <Text style={{ color: c.onSurface, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={[catStyles.modalBtn, { backgroundColor: c.primary, flex: 1 }]}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const catStyles = StyleSheet.create({
  addCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  catCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalBox: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
});

// --- Helpers ---

const getCategoryIcon = (category: string, size: number, color: string) => {
  const name = category.toLowerCase();
  if (name.includes('apartamento') || name.includes('cuota')) return <HomeIcon size={size} color={color} />;
  if (name.includes('alquiler')) return <HomeIcon size={size} color={color} />;
  if (name.includes('supermercado')) return <ShoppingCart size={size} color={color} />;
  if (name.includes('comida') || name.includes('food')) return <Utensils size={size} color={color} />;
  if (name.includes('delivery')) return <Pizza size={size} color={color} />;
  if (name.includes('combustible')) return <Fuel size={size} color={color} />;
  if (name.includes('pasaje') || name.includes('transit') || name.includes('transporte')) return <Car size={size} color={color} />;
  if (name.includes('luz')) return <Droplets size={size} color={color} />;
  if (name.includes('internet') || name.includes('wifi')) return <Wifi size={size} color={color} />;
  if (name.includes('celular') || name.includes('recarga')) return <Smartphone size={size} color={color} />;
  if (name.includes('netflix') || name.includes('streaming')) return <Tv size={size} color={color} />;
  if (name.includes('diezmo') || name.includes('ofrenda') || name.includes('iglesia')) return <Church size={size} color={color} />;
  if (name.includes('barberia') || name.includes('salon') || name.includes('sal\u00f3n')) return <Scissors size={size} color={color} />;
  if (name.includes('farmacia') || name.includes('salud')) return <Pill size={size} color={color} />;
  if (name.includes('salida') || name.includes('ocio') || name.includes('fun')) return <Clapperboard size={size} color={color} />;
  if (name.includes('emergencia') || name.includes('fondo')) return <Banknote size={size} color={color} />;
  if (name.includes('viaje') || name.includes('aniversario') || name.includes('plenitud')) return <Plane size={size} color={color} />;
  if (name.includes('tablet') || name.includes('tech')) return <MonitorSmartphone size={size} color={color} />;
  if (name.includes('do\u00f1a') || name.includes('dona')) return <Heart size={size} color={color} />;
  if (name.includes('compra') || name.includes('shop')) return <ShoppingBag size={size} color={color} />;
  if (name.includes('factura') || name.includes('bill')) return <Receipt size={size} color={color} />;
  return <MoreHorizontal size={size} color={color} />;
};

// --- Main App ---

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');
  const [prevScreen, setPrevScreen] = useState<Screen>('Home');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const currentMonth = Api.getAutoMonth();

  const c = isDark ? darkColors : lightColors;
  colors = c; // keep static ref in sync

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
      const [dash, exps] = await Promise.all([
        Api.getDashboard(currentMonth),
        Api.getExpenses(currentMonth),
      ]);
      
      setDashboardData(dash);
      setExpenses(exps ?? []);
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
      setActiveScreen('History');
    } catch (err) {
      console.error('Failed to save expense', err);
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

  return (
    <ThemeContext.Provider value={themeCtx}>
    <SafeAreaView style={[styles.container, { backgroundColor: c.surface }]}>
      <StatusBar barStyle={c.statusBar} backgroundColor={c.surface} />
      {activeScreen !== 'Categories' && <TopBar title={activeScreen} />}

      <View style={{ flex: 1 }}>
        {activeScreen === 'Home' && (
          <HomeScreen data={dashboardData} expenses={expenses} />
        )}
        {activeScreen === 'History' && (
          <HistoryScreen expenses={expenses} onDelete={handleDeleteExpense} />
        )}
        {activeScreen === 'Budget' && (
          <BudgetScreen data={dashboardData} />
        )}
        {activeScreen === 'Settings' && (
          <SettingsScreen onNavCategories={() => handleNav('Categories')} />
        )}
        {activeScreen === 'Categories' && (
          <CategoriesScreen onBack={() => setActiveScreen('Settings')} onReload={loadData} />
        )}
      </View>

      {activeScreen === 'Add' && (
        <AddExpenseScreen
          onSave={handleSaveExpense}
          onCancel={() => setActiveScreen(prevScreen)}
          budgetCategories={dashboardData?.categories ?? []}
        />
      )}

      {activeScreen !== 'Add' && activeScreen !== 'Categories' && (
        <TouchableOpacity onPress={() => handleNav('Add')} style={styles.fab}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {activeScreen !== 'Categories' && (
        <BottomNav active={activeScreen === 'Add' ? prevScreen : activeScreen} onNav={handleNav} />
      )}
    </SafeAreaView>
    </ThemeContext.Provider>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    zIndex: 50,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.onSurfaceVariant,
    opacity: 0.5,
  },
  placeholderText: {
    color: colors.onSurfaceVariant,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.zinc500,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 4,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    overflow: 'hidden',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(199,210,254,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  balanceSubLabel: {
    fontSize: 10,
    color: colors.white60,
    textTransform: 'uppercase',
  },
  balanceSubValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.zinc400,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.indigo400,
  },
  catCard: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  catSub: {
    fontSize: 10,
    color: colors.zinc500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catSpent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  catBudget: {
    fontSize: 10,
    color: colors.zinc500,
  },
  progressBg: {
    height: 6,
    width: '100%',
    backgroundColor: colors.white5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  historyCard: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.rose400,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(251,113,133,0.1)',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 32,
    left: '5%',
    right: '5%',
    height: 64,
    backgroundColor: 'rgba(24,24,27,0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.white5,
    zIndex: 40,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  fabCenter: {
    // removed - FAB is now separate
  },
  fabText: {
    // removed - FAB is now separate
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 45,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catSelectBtn: {
    width: (Dimensions.get('window').width - 48 - 24) / 3,
    borderRadius: 24,
    overflow: 'hidden',
  },
  catSelectInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  catSelectLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  noteInput: {
    height: 56,
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white5,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: colors.onSurface,
    fontSize: 14,
  },
  addCatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  addCatItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  budgetTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  budgetMonth: {
    fontSize: 14,
    color: colors.zinc500,
    marginTop: 4,
  },
  budgetSummaryCard: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 28,
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetSummaryLabel: {
    fontSize: 11,
    color: colors.zinc500,
    marginBottom: 4,
  },
  budgetSummaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  budgetSummaryBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  budgetProgressBg: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  budgetPercentText: {
    fontSize: 12,
    color: colors.zinc500,
    textAlign: 'right',
    marginTop: 8,
  },
  budgetCatHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    height: 44,
  },
  budgetCatCard: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  budgetCatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetCatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  budgetEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetCatSpent: {
    fontSize: 13,
    color: colors.onSurface,
  },
  budgetCatLimit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
});
