import { Home as HomeIcon, PiggyBank, Settings, TrendingUp, Wallet } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { useTheme } from '../theme';
import type { Screen } from '../types';

export const BottomNav = ({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) => {
  const { c } = useTheme();
  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'Home', icon: HomeIcon, label: 'Inicio' },
    { id: 'Budget', icon: Wallet, label: 'Presupuesto' },
    { id: 'Savings', icon: PiggyBank, label: 'Ahorros' },
    { id: 'Incomes', icon: TrendingUp, label: 'Ingresos' },
    { id: 'Settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <View style={[styles.bottomNav, { backgroundColor: c.navBg, borderTopColor: c.cardBorder }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <TouchableOpacity key={tab.id} onPress={() => onNav(tab.id)} style={styles.navTab}>
            <Icon size={20} color={isActive ? c.primary : c.zinc600} />
            <Text style={[styles.navLabel, { color: isActive ? c.primary : c.zinc600 }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
