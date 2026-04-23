import { Briefcase, Trash2, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { homeS, styles } from '../styles';
import { useTheme } from '../theme';
import type { Income, IncomeCat, Screen } from '../types';
import { MONTH_LABELS } from '../types';

export const IncomesScreen = ({
  incomes,
  incomeCategories,
  onDelete,
  onNav,
}: {
  incomes: Income[];
  incomeCategories: IncomeCat[];
  onDelete: (id: string) => void;
  onNav: (s: Screen) => void;
}) => {
  const { c } = useTheme();
  const totalIncome = incomes.reduce((s, inc) => s + inc.amount, 0);

  const incomeBySource: Record<string, number> = {};
  incomes.forEach((inc) => {
    incomeBySource[inc.source] = (incomeBySource[inc.source] || 0) + inc.amount;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={[styles.budgetTitle, { color: c.onSurface }]}>Ingresos</Text>
        <Text style={[styles.budgetMonth, { color: c.zinc500 }]}>{MONTH_LABELS[new Date().getMonth()]} {new Date().getFullYear()}</Text>
      </View>

      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color={c.amber500} />
          </View>
          <View>
            <Text style={{ color: c.zinc500, fontSize: 13 }}>Total Ingresos este Mes</Text>
            <Text style={{ color: c.amber400, fontSize: 26, fontWeight: '800' }}>
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {incomeCategories.length > 0 && (
        <>
          <Text style={[styles.budgetCatHeader, { color: c.onSurface, marginTop: 8 }]}>Fuentes de Ingreso</Text>
          {incomeCategories.map((cat) => {
            const received = incomeBySource[cat.name] ?? 0;
            const percent = cat.expectedAmount > 0 ? Math.min((received / cat.expectedAmount) * 100, 100) : 0;
            return (
              <View key={cat.name} style={[styles.budgetCatCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <View style={styles.budgetCatTop}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catIconBox, { backgroundColor: 'rgba(245,158,11,0.08)' }]}>
                      <Briefcase size={20} color={c.amber500} />
                    </View>
                    <Text style={[styles.budgetCatName, { color: c.onSurface }]}>{cat.name}</Text>
                  </View>
                </View>
                <View style={styles.budgetCatBottom}>
                  <Text style={{ fontSize: 13, color: c.amber400 }}>
                    ${received.toLocaleString()} recibido
                  </Text>
                  <Text style={[styles.budgetCatLimit, { color: c.onSurface }]}>
                    ${cat.expectedAmount.toLocaleString()} esperado
                  </Text>
                </View>
                <View style={[styles.budgetProgressBg, { backgroundColor: c.progressBg }]}>
                  <View style={[styles.budgetProgressFill, { width: `${percent}%`, backgroundColor: c.amber500 }]} />
                </View>
              </View>
            );
          })}
        </>
      )}

      <Text style={[styles.budgetCatHeader, { color: c.onSurface, marginTop: 8 }]}>Historial</Text>
      {incomes.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: c.zinc500 }}>No hay ingresos este mes</Text>
        </View>
      )}
      {incomes.map((inc, i) => (
        <View key={inc._id ?? `inc-${i}`} style={[styles.historyCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
          <View style={[styles.catLeft, { flex: 1 }]}>
            <View style={[styles.catIconBox, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
              <TrendingUp size={20} color={c.amber400} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catName, { color: c.onSurface }]}>{inc.note || inc.source}</Text>
              <Text style={[styles.catSub, { color: c.zinc500 }]}>{inc.source} • {inc.date}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: c.amber400 }}>+${inc.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => inc._id && onDelete(inc._id)} style={styles.deleteBtn}>
              <Trash2 size={16} color={c.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
