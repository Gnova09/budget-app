import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCategoryIcon, getCatIconBg } from '../helpers/icons';
import * as Api from '../services/api';
import { catStyles, styles } from '../styles';
import { useTheme } from '../theme';
import type { TemplateCategory } from '../types';

export const CategoriesScreen = ({ onBack, onReload }: { onBack: () => void; onReload: () => void }) => {
  const { c } = useTheme();
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [editCat, setEditCat] = useState<TemplateCategory | null>(null);
  const [editLimit, setEditLimit] = useState('');

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
