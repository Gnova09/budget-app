import {
    Banknote,
    Car,
    Church,
    Clapperboard,
    Droplets,
    Fuel,
    Heart,
    Home as HomeIcon,
    MonitorSmartphone,
    MoreHorizontal,
    Pill,
    Pizza,
    Plane,
    Receipt,
    Scissors,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Tv,
    Utensils,
    Wifi
} from 'lucide-react-native';
import React from 'react';

export const categoryIconColors: Record<string, string> = {
  housing: '#bfdbfe',
  alquiler: '#bfdbfe',
  apartamento: '#bfdbfe',
  food: '#ddd6fe',
  comida: '#ddd6fe',
  supermercado: '#ddd6fe',
  transport: '#fde68a',
  transporte: '#fde68a',
  combustible: '#fde68a',
  fun: '#bfdbfe',
  ocio: '#bfdbfe',
  salida: '#bfdbfe',
  bills: '#e5e7eb',
  factura: '#e5e7eb',
  luz: '#e5e7eb',
  shopping: '#bfdbfe',
  compra: '#bfdbfe',
};

export const getCatIconBg = (name: string) => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(categoryIconColors)) {
    if (lower.includes(key)) return categoryIconColors[key];
  }
  return '#e5e7eb';
};

export const getCategoryIcon = (category: string, size: number, color: string) => {
  const name = category.toLowerCase();
  if (name.includes('apartamento') || name.includes('cuota')) return <HomeIcon size={size} color={color} />;
  if (name.includes('alquiler')) return <HomeIcon size={size} color={color} />;
  if (name.includes('supermercado')) return <ShoppingCart size={size} color={color} />;
  if (name.includes('comida') || name.includes('food')) return <Utensils size={size} color={color} />;
  if (name.includes('delivery')) return <Pizza size={size} color={color} />;
  if (name.includes('combustible')) return <Fuel size={size} color={color} />;
  if (name.includes('pasaje') || name.includes('transit') || name.includes('transporte')) return <Car size={size} color={color} />;
  if (name.includes('luz')) return <Droplets size={size} color={color} />;
  if (name.includes('internet') || name.includes('wifi')) return <Wifi size={size} color={color} />;
  if (name.includes('celular') || name.includes('recarga')) return <Smartphone size={size} color={color} />;
  if (name.includes('netflix') || name.includes('streaming')) return <Tv size={size} color={color} />;
  if (name.includes('diezmo') || name.includes('ofrenda') || name.includes('iglesia')) return <Church size={size} color={color} />;
  if (name.includes('barberia') || name.includes('salon') || name.includes('salón')) return <Scissors size={size} color={color} />;
  if (name.includes('farmacia') || name.includes('salud')) return <Pill size={size} color={color} />;
  if (name.includes('salida') || name.includes('ocio') || name.includes('fun')) return <Clapperboard size={size} color={color} />;
  if (name.includes('emergencia') || name.includes('fondo')) return <Banknote size={size} color={color} />;
  if (name.includes('viaje') || name.includes('aniversario') || name.includes('plenitud')) return <Plane size={size} color={color} />;
  if (name.includes('tablet') || name.includes('tech')) return <MonitorSmartphone size={size} color={color} />;
  if (name.includes('doña') || name.includes('dona')) return <Heart size={size} color={color} />;
  if (name.includes('compra') || name.includes('shop')) return <ShoppingBag size={size} color={color} />;
  if (name.includes('factura') || name.includes('bill')) return <Receipt size={size} color={color} />;
  return <MoreHorizontal size={size} color={color} />;
};
