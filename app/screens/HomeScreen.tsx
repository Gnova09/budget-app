import { Calendar, PiggyBank, Shapes, TrendingUp, Wallet } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DonutChart } from '../components/DonutChart';
import { getCategoryIcon } from '../helpers/icons';
import * as Api from '../services/api';
import { homeS, styles } from '../styles';
import { useTheme } from '../theme';
import type { DashboardData, Expense, Income, SavingsSummary } from '../types';
import { MONTH_LABELS } from '../types';

const DONUT_COLORS = ['#1f2937', '#6b7280', '#9ca3af', '#c4b5fd'];

interface MonthlySpend { month: string; label: string; total: number }

export const HomeScreen = ({ data, expenses, incomes }: { data: DashboardData | null; expenses: Expense[]; incomes: Income[] }) => {
  const { c } = useTheme();
  const [trend, setTrend] = useState<MonthlySpend[]>([]);
  const [savingsSummary, setSavingsSummary] = useState<SavingsSummary | null>(null);

  useEffect(() => {
    Api.getSavingsSummary()
      .then(setSavingsSummary)
      .catch(() => {});
  }, []);

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

  const now = new Date();
  const monthLabel = MONTH_LABELS[now.getMonth()];
  const maxTrend = Math.max(...trend.map(t => t.total), 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
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

      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color={'#f59e0b'} />
          </View>
          <View>
            <Text style={{ color: c.zinc500, fontSize: 13, fontWeight: '500' }}>Ingresos del Mes</Text>
            <Text style={{ color: c.onSurface, fontSize: 24, fontWeight: '800' }}>
              ${incomes.reduce((s, inc) => s + inc.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        {(() => {
          const bySource: Record<string, number> = {};
          incomes.forEach((inc) => { bySource[inc.source] = (bySource[inc.source] || 0) + inc.amount; });
          const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
          if (sources.length === 0) return <Text style={{ color: c.zinc500, fontSize: 13 }}>Sin ingresos este mes</Text>;
          return sources.map(([source, amount]) => (
            <View key={source} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.cardBorder }}>
              <Text style={{ color: c.onSurface, fontSize: 14, fontWeight: '500' }}>{source}</Text>
              <Text style={{ color: c.onSurface, fontSize: 14, fontWeight: '600' }}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          ));
        })()}
      </View>

      <View style={[homeS.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <PiggyBank size={20} color={'#10b981'} />
          </View>
          <View>
            <Text style={{ color: c.zinc500, fontSize: 13, fontWeight: '500' }}>Ahorros del Año</Text>
            <Text style={{ color: c.onSurface, fontSize: 24, fontWeight: '800' }}>
              ${(savingsSummary?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        {savingsSummary && savingsSummary.byCategory.length > 0 ? (
          savingsSummary.byCategory.map((cat) => (
            <View key={cat.category} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.cardBorder }}>
              <Text style={{ color: c.onSurface, fontSize: 14, fontWeight: '500' }}>{cat.category}</Text>
              <Text style={{ color: c.onSurface, fontSize: 14, fontWeight: '600' }}>${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: c.zinc500, fontSize: 13 }}>Sin ahorros este año</Text>
        )}
        {savingsSummary && savingsSummary.byMonth.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: c.zinc500, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Por mes</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {(() => {
                const months = savingsSummary.byMonth.slice().reverse();
                const maxAmt = Math.max(...months.map(m => m.amount), 1);
                return months.map((m) => {
                  const h = (m.amount / maxAmt) * 65;
                  const parts = m.month.split('-');
                  const label = MONTH_LABELS[parseInt(parts[1], 10) - 1] || m.month;
                  return (
                    <View key={m.month} style={{ alignItems: 'center', flex: 1 }}>
                      <View style={{ height: Math.max(h, 4), width: 18, borderRadius: 4, backgroundColor: '#10b981' }} />
                      <Text style={{ color: c.zinc500, fontSize: 10, marginTop: 4 }}>{label}</Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        )}
      </View>

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
