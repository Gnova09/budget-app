import { LinearGradient } from 'expo-linear-gradient';
import { Check, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TopBar } from '../components/TopBar';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { SavingsCat } from '../types';

export const AddSavingScreen = ({
  onSave,
  onCancel,
  savingsCategories,
}: {
  onSave: (e: { amount: number; category: string; note?: string }) => void;
  onCancel: () => void;
  savingsCategories: SavingsCat[];
}) => {
  const { c } = useTheme();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(savingsCategories.length > 0 ? savingsCategories[0].name : '');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || !category) return;
    onSave({ amount: parseFloat(amount), category, note });
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface, zIndex: 60, paddingTop: 24 }]}>
      <TopBar title="Agregar Ahorro" showBack onBack={onCancel} />
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
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Categoría de Ahorro</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 12 }}>
            {savingsCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setCategory(cat.name)}
                  style={[styles.addCatItem, isSelected && styles.addCatItemSelected]}
                >
                  <View style={styles.catLeft}>
                    <View style={[styles.catIconBox, { backgroundColor: isSelected ? 'rgba(16,185,129,0.15)' : c.white5 }]}>
                      <Target size={20} color={isSelected ? '#10b981' : c.onSurface} />
                    </View>
                    <View>
                      <Text style={[styles.catName, isSelected && { color: '#10b981' }]}>{cat.name}</Text>
                      <Text style={styles.catSub}>Meta: ${cat.targetAmount.toLocaleString()}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color="#10b981" />}
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
            placeholder="Descripción del ahorro"
            placeholderTextColor={c.zinc600}
            style={[styles.noteInput, { backgroundColor: c.white5, borderColor: c.white5, color: c.onSurface }]}
          />
        </View>

        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient colors={['#10b981', '#34d399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtn}>
            <Check size={24} color="#fff" />
            <Text style={styles.submitText}>Guardar Ahorro</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
