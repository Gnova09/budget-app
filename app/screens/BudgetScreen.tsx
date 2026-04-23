import { Pencil, Search, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCategoryIcon } from '../helpers/icons';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { DashboardData, Expense } from '../types';

export const BudgetScreen = ({ data, expenses, onDeleteExpense }: { data: DashboardData | null; expenses: Expense[]; onDeleteExpense: (id: string) => void }) => {
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

      <Text style={[styles.budgetCatHeader, { color: c.onSurface, marginTop: 16 }]}>Historial de Gastos</Text>
      {expenses.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: c.zinc500 }}>No hay gastos este mes</Text>
        </View>
      )}
      {expenses.map((exp, index) => (
        <View key={exp._id ?? `exp-${index}`} style={[styles.historyCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
          <View style={[styles.catLeft, { flex: 1 }]}>
            <View style={[styles.catIconBox, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
              {getCategoryIcon(exp.category, 20, c.indigo400)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catName, { color: c.onSurface }]}>{exp.note || exp.category}</Text>
              <Text style={[styles.catSub, { color: c.zinc500 }]}>{exp.category} • {exp.date}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={[styles.expAmount, { color: c.rose400 }]}>-${exp.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => exp._id && onDeleteExpense(exp._id)} style={styles.deleteBtn}>
              <Trash2 size={16} color={c.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
