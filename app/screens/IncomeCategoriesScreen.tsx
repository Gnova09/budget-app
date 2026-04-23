import { ArrowLeft, Briefcase, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Api from '../services/api';
import { catStyles, styles } from '../styles';
import { useTheme } from '../theme';
import type { IncomeCat } from '../types';

export const IncomeCategoriesScreen = ({ onBack, onReload }: { onBack: () => void; onReload: () => void }) => {
  const { c } = useTheme();
  const [categories, setCategories] = useState<IncomeCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExpected, setNewExpected] = useState('');

  const loadCats = async () => {
    try {
      setLoading(true);
      const data = await Api.getIncomeCategories();
      setCategories(data ?? []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadCats(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newExpected.trim()) return;
    try {
      await Api.addIncomeCategory({ name: newName.trim(), expectedAmount: parseFloat(newExpected) });
      setNewName(''); setNewExpected(''); setShowAdd(false);
      await loadCats(); onReload();
    } catch (err) { console.error(err); }
  };

  const handleDelete = (cat: IncomeCat) => {
    Alert.alert('Eliminar', `¿Eliminar "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await Api.deleteIncomeCategory(cat.name); await loadCats(); onReload(); } catch (err) { console.error(err); }
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <View style={[styles.topBar, { backgroundColor: c.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: c.onSurface }]}>Categorías de Ingreso</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.iconBtn}>
          <Plus size={22} color={c.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={[catStyles.addCard, { borderColor: c.zinc400 }]}>
          <View style={[catStyles.addIconCircle, { backgroundColor: c.white10 }]}>
            <Plus size={22} color={c.zinc500} />
          </View>
          <View>
            <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>Agregar Fuente de Ingreso</Text>
            <Text style={{ color: c.zinc500, fontSize: 13 }}>Definir ingreso esperado</Text>
          </View>
        </TouchableOpacity>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}><Text style={{ color: c.zinc500 }}>Cargando...</Text></View>
        ) : categories.map((cat) => (
          <View key={cat.name} style={[catStyles.catCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
              <View style={[catStyles.catCircle, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                <Briefcase size={22} color={c.amber500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>{cat.name}</Text>
                <Text style={{ color: c.zinc500, fontSize: 13 }}>Esperado: ${cat.expectedAmount.toLocaleString()}/mes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(cat)} style={{ padding: 8 }}>
              <Trash2 size={18} color={c.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {showAdd && (
        <View style={catStyles.modalOverlay}>
          <View style={[catStyles.modalBox, { backgroundColor: c.surfaceBright }]}>
            <Text style={[catStyles.modalTitle, { color: c.onSurface }]}>Nueva Fuente de Ingreso</Text>
            <Text style={{ color: c.zinc500, marginBottom: 4 }}>Nombre</Text>
            <TextInput
              style={[catStyles.modalInput, { color: c.onSurface, borderColor: c.cardBorder, backgroundColor: c.cardBg }]}
              value={newName} onChangeText={setNewName}
              placeholder="Ej. Salario" placeholderTextColor={c.zinc500}
            />
            <Text style={{ color: c.zinc500, marginBottom: 4, marginTop: 12 }}>Monto esperado mensual</Text>
            <TextInput
              style={[catStyles.modalInput, { color: c.onSurface, borderColor: c.cardBorder, backgroundColor: c.cardBg }]}
              keyboardType="numeric" value={newExpected} onChangeText={setNewExpected}
              placeholder="Ej. 3000" placeholderTextColor={c.zinc500}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setShowAdd(false); setNewName(''); setNewExpected(''); }}
                style={[catStyles.modalBtn, { backgroundColor: c.white10, flex: 1 }]}>
                <Text style={{ color: c.onSurface, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd}
                style={[catStyles.modalBtn, { backgroundColor: c.amber500, flex: 1 }]}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
