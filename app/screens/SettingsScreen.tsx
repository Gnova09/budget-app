import {
    Bell,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    Heart,
    LogOut,
    Moon,
    PiggyBank,
    RefreshCw,
    Shapes,
    Sun,
    TrendingUp,
    Wallpaper,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { stl, styles } from '../styles';
import { useTheme } from '../theme';

const FULL_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const SettingsScreen = ({ onNavCategories, onNavSavingsCategories, onNavIncomeCategories, selectedMonth, onMonthChange }: {
  onNavCategories?: () => void;
  onNavSavingsCategories?: () => void;
  onNavIncomeCategories?: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}) => {
  const { isDark, toggleTheme, c } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const [selYear, selMonthIdx] = selectedMonth.split('-').map(Number);
  const isCurrentMonth = selectedMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const changeMonth = (delta: number) => {
    const d = new Date(selYear, selMonthIdx - 1 + delta, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(key);
  };

  const resetToCurrentMonth = () => {
    const now = new Date();
    onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const SettingRow = ({ icon, label, right, last, onPress }: {
    icon: React.ReactNode; label: string; right?: React.ReactNode; last?: boolean; onPress?: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      style={[styles.settingsRow, !last && { borderBottomWidth: 1, borderBottomColor: c.cardBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {icon}
        <Text style={{ fontSize: 15, color: c.onSurface }}>{label}</Text>
      </View>
      {right}
    </TouchableOpacity>
  );

  const Chevron = () => <ChevronRight size={18} color={c.zinc500} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder, alignItems: 'center', paddingVertical: 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={[stl.avatar, { borderColor: c.primary }]}>
              <Text style={{ fontSize: 28 }}>👨‍💼</Text>
            </View>
            <Text style={{ color: c.onSurface, marginTop: 8, fontWeight: '600', fontSize: 14 }}>Georges</Text>
          </View>
          <Heart size={20} color={c.zinc400} />
          <View style={{ alignItems: 'center' }}>
            <View style={[stl.avatar, { borderColor: c.zinc400 }]}>
              <Text style={{ fontSize: 28 }}>👩‍💼</Text>
            </View>
            <Text style={{ color: c.onSurface, marginTop: 8, fontWeight: '600', fontSize: 14 }}>Nicole</Text>
          </View>
        </View>
      </View>

      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>PREFERENCIAS</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <SettingRow
          icon={<Bell size={20} color={c.primary} />}
          label="Notificaciones de Presupuesto"
          right={
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: '#d1d5db', true: '#6366f1' }}
              thumbColor="#fff"
            />
          }
        />
        <SettingRow
          icon={<Wallpaper size={20} color={c.primary} />}
          label="Moneda"
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: c.zinc500, fontSize: 14 }}>USD ($)</Text>
              <Chevron />
            </View>
          }
          last
        />
      </View>

      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>PERSONALIZACIÓN</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <SettingRow
          icon={isDark ? <Moon size={20} color={c.primary} /> : <Sun size={20} color={c.primary} />}
          label="Apariencia"
          onPress={toggleTheme}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: c.zinc500, fontSize: 14 }}>{isDark ? 'Oscuro' : 'Claro'}</Text>
              <Chevron />
            </View>
          }
        />
        <SettingRow
          icon={<Shapes size={20} color={c.primary} />}
          label="Categorías de Gastos"
          onPress={() => onNavCategories && onNavCategories()}
          right={<Chevron />}
        />
        <SettingRow
          icon={<PiggyBank size={20} color={c.emerald500} />}
          label="Categorías de Ahorro"
          onPress={() => onNavSavingsCategories && onNavSavingsCategories()}
          right={<Chevron />}
        />
        <SettingRow
          icon={<TrendingUp size={20} color={c.amber500} />}
          label="Categorías de Ingreso"
          onPress={() => onNavIncomeCategories && onNavIncomeCategories()}
          right={<Chevron />}
          last
        />
      </View>

      <Text style={[stl.sectionLabel, { color: c.zinc500 }]}>CUENTA</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <CalendarDays size={20} color={c.primary} />
            <Text style={{ fontSize: 15, color: c.onSurface, fontWeight: '600' }}>Mes de Consulta</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
              <ChevronLeft size={22} color={c.onSurface} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: c.onSurface, fontSize: 18, fontWeight: '700' }}>
                {FULL_MONTHS[selMonthIdx - 1]}
              </Text>
              <Text style={{ color: c.zinc500, fontSize: 13 }}>{selYear}</Text>
            </View>
            <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8 }}>
              <ChevronRight size={22} color={c.onSurface} />
            </TouchableOpacity>
          </View>
          {!isCurrentMonth && (
            <TouchableOpacity
              onPress={resetToCurrentMonth}
              style={{ alignSelf: 'center', marginTop: 10, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, backgroundColor: c.primary + '22' }}>
              <Text style={{ color: c.primary, fontSize: 13, fontWeight: '600' }}>Volver al mes actual</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 1, backgroundColor: c.cardBorder }} />
        <SettingRow
          icon={<RefreshCw size={20} color={c.primary} />}
          label="Sincronizar Datos"
          right={
            <Text style={{ color: c.zinc500, fontSize: 14 }}>Justo ahora</Text>
          }
        />
        <SettingRow
          icon={<Download size={20} color={c.primary} />}
          label="Exportar Datos (CSV)"
          right={<Chevron />}
        />
        <SettingRow
          icon={<LogOut size={20} color={c.error} />}
          label="Cerrar Sesión"
          right={null}
          last
        />
      </View>
    </ScrollView>
  );
};
