import { LinearGradient } from 'expo-linear-gradient';
import { Check, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TopBar } from '../components/TopBar';
import { getCategoryIcon } from '../helpers/icons';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { CategorySummary } from '../types';

export const AddExpenseScreen = ({ onSave, onCancel, budgetCategories, initialCategory }: { onSave: (e: any) => void; onCancel: () => void; budgetCategories: CategorySummary[]; initialCategory?: string }) => {
  const { c } = useTheme();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(initialCategory || (budgetCategories.length > 0 ? budgetCategories[0].category : ''));
  const [note, setNote] = useState('');
  const [catSearch, setCatSearch] = useState('');

  const filteredCats = budgetCategories.filter((cat) =>
    cat.category.toLowerCase().includes(catSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!amount || !category) return;
    onSave({ amount: parseFloat(amount), category, note });
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface, zIndex: 60, paddingTop: 24 }]}>
      <TopBar title="Agregar Gasto" showBack onBack={onCancel} />
      <ScrollView style={{ flex: 1, paddingTop: 80 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={[styles.labelSmall, { marginBottom: 16 }]}>Monto</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: c.zinc600, marginBottom: 4 }}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={c.zinc800}
              keyboardType="decimal-pad"
              autoFocus
              style={{ fontSize: 48, fontWeight: 'bold', color: c.onSurface, textAlign: 'center', minWidth: 200 }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 25 }}>
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Seleccionar Categoria</Text>
          <View style={[styles.searchBox, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <Search size={18} color={c.zinc500} />
            <TextInput
              value={catSearch}
              onChangeText={setCatSearch}
              placeholder="Buscar categoria..."
              placeholderTextColor={c.zinc600}
              style={[styles.searchInput, { color: c.onSurface }]}
            />
            {catSearch.length > 0 && (
              <TouchableOpacity onPress={() => setCatSearch('')}>
                <X size={16} color={c.zinc500} />
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
                    <View style={[styles.catIconBox, { backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : c.white5 }]}>
                      {getCategoryIcon(cat.category, 20, isSelected ? c.primary : c.onSurface)}
                    </View>
                    <View>
                      <Text style={[styles.catName, isSelected && { color: c.primary }]}>{cat.category}</Text>
                      <Text style={styles.catSub}>Disponible: ${(cat.available ?? (cat.limit - cat.spent)).toLocaleString()}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color={c.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Nota (Opcional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="En qué fue este gasto?"
            placeholderTextColor={c.zinc600}
            style={[styles.noteInput, { backgroundColor: c.white5, borderColor: c.white5, color: c.onSurface }]}
          />
        </View>

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
