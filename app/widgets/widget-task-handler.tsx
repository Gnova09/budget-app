import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { QuickExpenseWidget } from './QuickExpenseWidget';

const nameToWidget: Record<string, React.FC> = {
  QuickExpense: QuickExpenseWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      if (Widget) {
        props.renderWidget(<Widget />);
      }
      break;
    case 'WIDGET_DELETED':
      break;
    case 'WIDGET_CLICK':
      // Click actions with OPEN_URI are handled automatically by the system
      // Click actions with OPEN_APP open the app
      break;
    default:
      break;
  }
}
