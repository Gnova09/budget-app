import React from 'react';
import {
    FlexWidget,
    TextWidget
} from 'react-native-android-widget';

const ROW1 = [
  { name: 'Supermercado', emoji: 'Cart' },
  { name: 'Comida', emoji: 'Food' },
  { name: 'Combustible', emoji: 'Gas' },
];

const ROW2 = [
  { name: 'Transporte', emoji: 'Car' },
  { name: 'Salud', emoji: 'Med' },
  { name: 'Ocio', emoji: 'Fun' },
];

function CategoryButton({ name, emoji }: { name: string; emoji: string }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `budgetapp://quick-add?category=${encodeURIComponent(name)}` }}
      style={{
        backgroundColor: '#27272a',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 3,
      }}
    >
      <TextWidget
        text={emoji}
        style={{
          fontSize: 11,
          color: '#a1a1aa',
          marginRight: 4,
        }}
      />
      <TextWidget
        text={name}
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#e4e4e7',
        }}
      />
    </FlexWidget>
  );
}

export function QuickExpenseWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#18181b',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
          marginBottom: 12,
        }}
      >
        <TextWidget
          text="Gasto Rapido"
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#ffffff',
          }}
        />
        <FlexWidget
          clickAction="OPEN_APP"
          style={{
            backgroundColor: '#6366f1',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <TextWidget
            text="+ Detallado"
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#ffffff',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Row 1 */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
          marginBottom: 6,
        }}
      >
        {ROW1.map((cat) => (
          <CategoryButton key={cat.name} name={cat.name} emoji={cat.emoji} />
        ))}
      </FlexWidget>

      {/* Row 2 */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
        }}
      >
        {ROW2.map((cat) => (
          <CategoryButton key={cat.name} name={cat.name} emoji={cat.emoji} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
           
