import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './app/widgets/widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);

// Import the default expo-router entry
import 'expo-router/entry';

