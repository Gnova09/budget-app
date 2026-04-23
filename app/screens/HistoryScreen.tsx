import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryIcon } from '../helpers/icons';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { Expense } from '../types';

export const HistoryScreen = ({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) => {
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
