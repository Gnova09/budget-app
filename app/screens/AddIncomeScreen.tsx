import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TopBar } from '../components/TopBar';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { IncomeCat } from '../types';

export const AddIncomeScreen = ({
  onSave,
  onCancel,
  incomeCategories,
}: {
  onSave: (e: { amount: number; source: string; note?: string }) => void;
  onCancel: () => void;
  incomeCategories: IncomeCat[];
}) => {
  const { c } = useTheme();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(incomeCategories.length > 0 ? incomeCategories[0].name : '');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || !source) return;
    onSave({ amount: parseFloat(amount), source, note });
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface, zIndex: 60, paddingTop: 24 }]}>
      <TopBar title="Agregar Ingreso" showBack onBack={onCancel} />
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
          <Text style={[styles.labelSmall, { marginBottom: 12 }]}>Fuente de Ingreso</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 12 }}>
            {incomeCategories.map((cat) => {
              const isSelected = source === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setSource(cat.name)}
                  style={[styles.addCatItem, isSelected && styles.addCatItemSelected]}
                >
                  <View style={styles.catLeft}>
                    <View style={[styles.catIconBox, { backgroundColor: isSelected ? 'rgba(245,158,11,0.15)' : c.white5 }]}>
                      <Briefcase size={20} color={isSelected ? '#f59e0b' : c.onSurface} />
                    </View>
                    <View>
                      <Text style={[styles.catName, isSelected && { color: '#f59e0b' }]}>{cat.name}</Text>
                      <Text style={styles.catSub}>Esperado: ${cat.expectedAmount.toLocaleString()}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color="#f59e0b" />}
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
            placeholder="Descripción del ingreso"
            placeholderTextColor={c.zinc600}
            style={[styles.noteInput, { backgroundColor: c.white5, borderColor: c.white5, color: c.onSurface }]}
          />
        </View>

        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient colors={['#f59e0b', '#fbbf24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtn}>
            <Check size={24} color="#fff" />
            <Text style={styles.submitText}>Guardar Ingreso</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
