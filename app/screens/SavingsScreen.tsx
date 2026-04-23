import { PiggyBank, Target, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { homeS, styles } from '../styles';
import { useTheme } from '../theme';
import type { Saving, SavingsCat, Screen } from '../types';
import { MONTH_LABELS } from '../types';

export const SavingsScreen = ({
  savings,
  savingsCategories,
  onDelete,
  onNav,
}: {
  savings: Saving[];
  savingsCategories: SavingsCat[];
  onDelete: (id: string) => void;
  onNav: (s: Screen) => void;
}) => {
  const { c } = useTheme();
  const totalSaved = savings.reduce((s, sv) => s + sv.amount, 0);

  const savedByCategory: Record<string, number> = {};
  savings.forEach((sv) => {
    savedByCategory[sv.category] = (savedByCategory[sv.category] || 0) + sv.amount;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={[styles.budgetTitle, { color: c.onSurface }]}>Ahorros</Text>
        <Text style={[styles.budgetMonth, { color: c.zinc500 }]}>{MONTH_LABELS[new Date().getMonth()]} {new Date().getFullYear()}</Text>
      </View>

      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <PiggyBank size={20} color={c.emerald500} />
          </View>
          <View>
            <Text style={{ color: c.zinc500, fontSize: 13 }}>Total Ahorrado este Mes</Text>
            <Text style={{ color: c.emerald400, fontSize: 26, fontWeight: '800' }}>
              ${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {savingsCategories.length > 0 && (
        <>
          <Text style={[styles.budgetCatHeader, { color: c.onSurface, marginTop: 8 }]}>Metas de Ahorro</Text>
          {savingsCategories.map((cat) => {
            const saved = savedByCategory[cat.name] ?? 0;
            const percent = cat.targetAmount > 0 ? Math.min((saved / cat.targetAmount) * 100, 100) : 0;
            return (
              <View key={cat.name} style={[styles.budgetCatCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <View style={styles.budgetCatTop}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catIconBox, { backgroundColor: 'rgba(16,185,129,0.08)' }]}>
                      <Target size={20} color={c.emerald500} />
                    </View>
                    <Text style={[styles.budgetCatName, { color: c.onSurface }]}>{cat.name}</Text>
                  </View>
                </View>
                <View style={styles.budgetCatBottom}>
                  <Text style={{ fontSize: 13, color: c.emerald400 }}>
                    ${saved.toLocaleString()} ahorrado
                  </Text>
                  <Text style={[styles.budgetCatLimit, { color: c.onSurface }]}>
                    ${cat.targetAmount.toLocaleString()} meta
                  </Text>
                </View>
                <View style={[styles.budgetProgressBg, { backgroundColor: c.progressBg }]}>
                  <View style={[styles.budgetProgressFill, { width: `${percent}%`, backgroundColor: c.emerald500 }]} />
                </View>
              </View>
            );
          })}
        </>
      )}

      <Text style={[styles.budgetCatHeader, { color: c.onSurface, marginTop: 8 }]}>Historial</Text>
      {savings.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: c.zinc500 }}>No hay ahorros este mes</Text>
        </View>
      )}
      {savings.map((sv, i) => (
        <View key={sv._id ?? `sv-${i}`} style={[styles.historyCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
          <View style={[styles.catLeft, { flex: 1 }]}>
            <View style={[styles.catIconBox, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
              <PiggyBank size={20} color={c.emerald400} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catName, { color: c.onSurface }]}>{sv.note || sv.category}</Text>
              <Text style={[styles.catSub, { color: c.zinc500 }]}>{sv.category} • {sv.date}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: c.emerald400 }}>+${sv.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => sv._id && onDelete(sv._id)} style={styles.deleteBtn}>
              <Trash2 size={16} color={c.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
