import { LinearGradient } from 'expo-linear-gradient';
import { Bell, X } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { useTheme } from '../theme';

export const TopBar = ({ title, showBack, onBack }: { title: string; showBack?: boolean; onBack?: () => void }) => {
  const { c } = useTheme();
  return (
    <View style={[styles.topBar, { backgroundColor: c.surface }]}>
      <View style={styles.topBarLeft}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <X size={20} color={c.onSurface} />
          </TouchableOpacity>
        ) : (
          <LinearGradient colors={['#6366f1', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </LinearGradient>
        )}
        {!showBack && <Text style={[styles.appTitle, { color: c.onSurface }]}>Finanzas</Text>}
      </View>
      {showBack && <Text style={[styles.screenTitle, { color: c.onSurface }]}>{title}</Text>}
      {!showBack && (
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={20} color={c.onSurface} />
        </TouchableOpacity>
      )}
      {showBack && <View style={{ width: 40 }} />}
    </View>
  );
};
