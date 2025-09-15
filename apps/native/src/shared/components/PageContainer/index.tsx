import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  backgroundColor?: string;
}

export function PageContainer({
  children,
  style,
  safeArea = true,
  backgroundColor = '#f5f5f5',
}: PageContainerProps) {
  const containerStyle = [styles.container, { backgroundColor }, style];

  if (safeArea) {
    return <SafeAreaView style={containerStyle}>{children}</SafeAreaView>;
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
